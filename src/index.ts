import type { AxiosResponse } from "axios";
import type * as types from "@/types";

import process from "node:process";
import readline from "node:readline";
import util from "node:util";

/** @see https://www.npmjs.com/package/dotenv */
import dotenv from "dotenv";

import { jsCssUploaderAsync } from "@/lib/kintone";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("start file upload? (N/y)", (ans) => {
  if (ans.toLowerCase() === "y") {
    mainAsync()
      .then((res) => {
        console.log(res.status, res.statusText);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        rl.close();
      });
  } else {
    rl.close();
  }
});

const mainAsync = async (): Promise<AxiosResponse> => {
  //const { values, positionals } = util.parseArgs({ options });
  const { values } = util.parseArgs({
    options: {
      mode: {
        type: "string",
        short: "m",
      },
    } as const,
  });

  dotenv.config();

  if (!process.env) {
    throw new Error("process.env is nothing.");
  }

  const { KINTONE_JSCSS_HOST, KINTONE_JSCSS_USERNAME, KINTONE_JSCSS_PASSWORD } =
    process.env;

  if (!KINTONE_JSCSS_HOST) {
    throw new Error("host is not setting.");
  } else if (!KINTONE_JSCSS_USERNAME) {
    throw new Error("username is not setting.");
  } else if (!KINTONE_JSCSS_PASSWORD) {
    throw new Error("password is not setting.");
  }
  const auth: types.JsCssUploader.Auth = {
    host: KINTONE_JSCSS_HOST,
    username: KINTONE_JSCSS_USERNAME,
    password: KINTONE_JSCSS_PASSWORD,
  };

  //const config: types.JsCssUploader.Config = {};

  switch (values.mode) {
    case "dev":
    case "test":
    case "prod":
      break;
    default:
  }

  const mode: types.JsCssUploader.Mode =
    values.mode === "dev"
      ? values.mode
      : values.mode === "test"
      ? values.mode
      : values.mode === "prod"
      ? values.mode
      : "dev";

  const json = (await import(`${__dirname}/kjcc.cjs`)) as object;
  const config: types.JsCssUploader.Config = json;

  const res: AxiosResponse = await jsCssUploaderAsync(auth, config, mode);

  return res;
};
