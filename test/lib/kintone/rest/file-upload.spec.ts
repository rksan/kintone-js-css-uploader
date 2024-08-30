import { describe, it } from "mocha";
import { assert } from "chai";

import axios from "axios";
import type { AxiosResponse } from "axios";
// setup mock
import { success } from "@test/excludes/axios-mock-server";

// test target
import { fileUploadAsync } from "@/lib/kintone/rest";

describe("file-upload.ts", () => {
  success(axios);

  const apiConfig = {
    host: "http://localhost",
    username: "test user",
    password: "123456",
  };

  it("fileUploadAsync()", async () => {
    const { host, username, password } = apiConfig;
    const responses: AxiosResponse[] = await fileUploadAsync({
      host,
      username,
      password,
      filePaths: ["./test/excludes/mock.js"],
    });

    responses.forEach((res) => {
      assert.isTrue(res.status === 200);
    });
  });
});
