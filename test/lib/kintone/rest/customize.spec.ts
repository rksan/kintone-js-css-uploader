import { describe, it } from "mocha";
import { assert } from "chai";

import axios from "axios";
import type { AxiosResponse } from "axios";
// setup mock
import { success } from "@test/excludes/axios-mock-server";

// test target
import { customizeAsync } from "@/lib/kintone/rest";

describe("customize.ts", () => {
  success(axios);

  const apiConfig = {
    host: "http://localhost",
    username: "test user",
    password: "123456",
  };

  it("customizeAsync()", async () => {
    const { host, username, password } = apiConfig;
    const response: AxiosResponse = await customizeAsync({
      host,
      username,
      password,
      json: {
        app: "1",
        scope: "ALL",
        desktop: [
          {
            js: {
              type: "FILE",
              file: {
                fileKey: "",
              },
            },
          },
        ],
      },
    });

    assert.isTrue(response.status === 200);
  });
});
