import { Buffer } from "node:buffer";
import axios from "axios";

type customizeAsync = (args: {
  host: string;
  username: string;
  password: string;
  json: object;
}) => Promise<void>;

export const customizeAsync: customizeAsync = async (args: {
  host: string;
  username: string;
  password: string;
  json: object;
}) => {
  const { host, username, password, json } = args;
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  return await axios.put("/k/v1/preview/app/customize.json", json, {
    method: "put",
    baseURL: host,
    headers: {
      "Content-type": "application/json",
      "X-Cybozu-Authorization": `${auth}`,
      Authorizatioin: `Basic ${auth}`,
    },
  });
};
