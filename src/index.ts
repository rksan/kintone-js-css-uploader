import type { AxiosResponse } from "axios";
import type * as types from "@/types";

import process from "node:process";
import readline from "node:readline";
import util from "node:util";

/** @see https://www.npmjs.com/package/dotenv */
import dotenv from "dotenv";

import { jsCssUploaderAsync } from "@/lib/kintone";

//------
// CLI
//------

// read .env
dotenv.config();

// read command line args
/** @see https://nodejs.org/api/util.html#utilparseargsconfig */
const { values } = util.parseArgs({
  options: {
    mode: {
      type: "string",
      short: "m",
    },
  } as const,
});

// setup read line
const rl: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// start cli
rl.question("start file upload? (N/y)", (ans: string) => {
  if (ans.toLowerCase() === "y") {
    // start process
    mainAsync()
      .then((res) => {
        console.log(res.status, res.statusText);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        // @TODO call other cli process
        rl.close();
      });
  } else {
    // end process
    rl.close();
  }
});

//-----------
// functions
//-----------
const mainAsync = async (): Promise<AxiosResponse> => {
  const { KINTONE_JSCSS_HOST, KINTONE_JSCSS_USERNAME, KINTONE_JSCSS_PASSWORD } =
    process.env;

  // check .env
  if (!KINTONE_JSCSS_HOST) {
    throw new Error("host is not setting.");
  } else if (!KINTONE_JSCSS_USERNAME) {
    throw new Error("username is not setting.");
  } else if (!KINTONE_JSCSS_PASSWORD) {
    throw new Error("password is not setting.");
  }

  // setup js-css-uploader auth
  const auth: types.JsCssUploader.Auth = {
    host: KINTONE_JSCSS_HOST,
    username: KINTONE_JSCSS_USERNAME,
    password: KINTONE_JSCSS_PASSWORD,
  };

  // check js-css-uploader mode.
  const mode: types.JsCssUploader.Mode =
    values.mode === "dev"
      ? values.mode
      : values.mode === "test"
      ? values.mode
      : values.mode === "prod"
      ? values.mode
      : "dev";

  // load js-css-uploader config
  const json = (await import(`${__dirname}/kjcc.cjs`)) as object;
  const config: types.JsCssUploader.Config = json;

  const res: AxiosResponse = await jsCssUploaderAsync(auth, config, mode);

  return res;
};
