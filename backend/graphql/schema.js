import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type User {
    _id: ID!
    name: String
    email: String
    role: String
    hostelId: ID
    collegeId: ID
  }

  type Query {
    health: String!
    me: User
  }
`);

export const rootValue = {
  health: () => "ok",
  me: (_args, context) => {
    return context?.user ?? null;
  },
};
