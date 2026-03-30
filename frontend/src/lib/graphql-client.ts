import apiClient from "./api-client";

export type GraphQLError = {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
};

export type GraphQLResponse<TData> = {
  data?: TData;
  errors?: GraphQLError[];
};

export async function graphqlRequest<TData, TVariables extends Record<string, unknown> | undefined = undefined>(
  query: string,
  variables?: TVariables
): Promise<TData> {
  const res = await apiClient.post<GraphQLResponse<TData>>("/graphql", {
    query,
    variables,
  });

  if (res.data?.errors?.length) {
    const message = res.data.errors.map((e) => e.message).join("\n");
    throw new Error(message);
  }

  if (!res.data?.data) {
    throw new Error("No data returned from GraphQL endpoint");
  }

  return res.data.data;
}
