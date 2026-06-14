import { GraphQLString } from "graphql";
import { UserResolver, userResolver } from "./user.resolver";

class UserGqlSchema {
  private readonly resolver: UserResolver;

  constructor() {
    this.resolver = userResolver;
  }

  registerQuery() {
    return {
      profile: {
        type: GraphQLString,
        args: {},
        resolve: this.resolver.getProfile,
      },
    };
  }

  registerMutation() {
    return {
      sayHi: {
        type: GraphQLString,
        args: {},
        resolve() {
          return "Hi there!";
        },
      },
    };
  }
}

export const userGqlSchema = new UserGqlSchema();
