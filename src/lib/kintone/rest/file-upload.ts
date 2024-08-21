import FormData from "form-data";
import fsp from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";
import axios from "axios";

import type { PathLike } from "node:fs";
import type { AxiosResponse } from "axios";

/**
 * fileUploadAsync
 * @param {{ host:string, username:string, password:string, filePath:string }} args
 * @returns {Promise<AxiosResponse>}
 */
export const fileUploadAsync = async (args: {
  host: string;
  username: string;
  password: string;
  filePaths: string | string[];
}): Promise<AxiosResponse[]> => {
  const { host, username, password } = args;
  const filePaths =
    typeof args.filePaths === "string" ? [args.filePaths] : args.filePaths;

  return await Promise.all(
    filePaths.map(async (filePath: string) => {
      const filename = path.basename(filePath);
      const file: Buffer = await fsp.readFile(filePath as PathLike);

      const form = new FormData();
      form.append("file", file, filename);

      const auth = Buffer.from(`${username}:${password}`).toString("base64");

      return await axios.post("/k/v1/file.json", form, {
        method: "post",
        baseURL: host,
        headers: {
          "Content-type": "multipart/form-data",
          "X-Cybozu-Authorization": `${auth}`,
          Authorizatioin: `Basic ${auth}`,
        },
      });
    })
  );
};
