import process from "node:process";
import path from "node:path";
import readline from "node:readline";
import util from "node:util";
import rest from "@/kintone/rest";

import type { ParseArgsConfig } from "node:util";
import type { AxiosResponse } from "axios";
import type { FileUploadRestRequest } from "@/kintone/rest/types";

const COMMAND_ARGS_CONFIG = {
  mode: {
    type: "string",
    short: "m",
  },
} as ParseArgsConfig & {
  [param: string]: object;
};

const { values, positionals } = util.parseArgs(COMMAND_ARGS_CONFIG);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const REST_API_CONFIG = {
  host: "https://6hos6yys89eo.cybozu.com",
  username: "kawabata_ryoji@center.comture.com",
  password: "69r8h73f",
};

rl.question("start file upload? (N/y)", (ans) => {
  if (ans === "y" || ans === "Y") {
    const { host, username, password } = REST_API_CONFIG;
    const filePath = path.resolve("./test/mock/mock.js");
    rest
      .fileUploadAsync({ host, username, password, filePath })
      .then((res) => {
        const data = res.data as {
          fileKey: string;
        };
        const fileKey: string = data.fileKey;
        const json: FileUploadRestRequest = {
          app: "5",
          scope: "ALL",
          desktop: {
            js: [
              {
                type: "FILE",
                file: { fileKey },
              },
            ],
          },
        };
        return rest.customizeAsync({ host, username, password, json });
      })
      .catch((res: AxiosResponse) => {
        const data = res.data as {
          message: string;
        };
        console.log(data.message);
      });
  }
  rl.close();
});
