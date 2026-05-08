import { redisClient } from "./redis.connection.js";

interface TokenParams {
    userId: string | number;
}

interface RevokeTokenParams extends TokenParams {
    jti: string;
}

interface RedisSetParams {
    key: string;
    value: any;
    ttl?: number | null;
}

interface RedisParams {
    key: string;
    value: any;
    ttl?: number | null;
}

export const revokeTokenKeyPrefix = ({ userId }:TokenParams) => {
  return `user:revokeToken:${userId}`;
};

export const revokeTokenKey = ({ userId, jti }:RevokeTokenParams) => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};

export const globalRevokeKey = ({ userId }:TokenParams) => {
  return `user:globalRevoke:${userId}`;
};

export const set = async ({ key, value, ttl = null }:RedisSetParams):Promise<string | null> => {
  try {
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis set error: ", error);
    return null;
  }
};

export const get = async ({ key }:{key:string}):Promise<string | null> => {
  try {
    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    console.log("Redis get error: ", error);
    return null;
  }
};

export const update = async ({ key, value, ttl = null }:RedisParams):Promise<string | boolean | null> => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis update error: ", error);
    return null;

  }
};

export const del = async ({ key }:{key: string}):Promise< boolean | number | null> => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.del(key);
  } catch (error) {
    console.log("Redis delete error: ", error);
    return null;
  }
};

export const expire = async ({ key, ttl }:{key: string; ttl:number}) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.log("Redis expire error: ", error);
    return null;
  }
};

export const ttl = async ({ key }:{ key:string}):Promise<boolean | number | null> => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.ttl(key);
  } catch (error) {
    console.log("Redis ttl error: ", error);
    return null;
  }
};

export const keys = async ({ pattern }:{ pattern: string}):Promise<string[] | null> => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.log("Redis keys error: ", error);
    return null;
  }
};
