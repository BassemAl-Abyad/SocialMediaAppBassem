import { createHandler } from "graphql-http/lib/use/express";
import { graphqlSchema } from "./schema.gql";

export { graphqlSchema } from "./schema.gql";

export const graphqlHandler = createHandler({ schema: graphqlSchema });
