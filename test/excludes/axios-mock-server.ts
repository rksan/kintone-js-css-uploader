import type { AxiosStatic } from "axios";

import MockAdapter from "axios-mock-adapter";

import crypto from "node:crypto";

const createMock = (axios: AxiosStatic) => {
  // @see https://www.npmjs.com/package/axios-mock-adapter
  return new MockAdapter(axios);
};

export const success = (axios: AxiosStatic) => {
  const mock = createMock(axios);

  mock
    .onPost("/k/v1/file.json")
    .reply(200, {
      data: { fileKey: crypto.randomUUID() },
      status: 200,
      statusText: "success",
    })
    .onPut("/k/v1/preview/app/customize.json")
    .reply(200, {
      data: { revision: "0" },
      status: 200,
      statusText: "success",
    });
};
