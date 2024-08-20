import { Buffer } from "node:buffer";
import axios from "axios";

import type { AxiosResponse } from "axios";

/**
 * customizeAsync
 * @param {{host: string, username: string, password: string, json: object}} args
 * @returns {Promise<AxiosResponse>}
 */
export const customizeAsync = async (args: {
  host: string;
  username: string;
  password: string;
  json: object;
}): Promise<AxiosResponse> => {
  const { host, username, password, json } = args;
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  const res = await axios.put("/k/v1/preview/app/customize.json", json, {
    method: "put",
    baseURL: host,
    headers: {
      "Content-type": "application/json",
      "X-Cybozu-Authorization": `${auth}`,
      Authorizatioin: `Basic ${auth}`,
    },
  });

  return res;
};
