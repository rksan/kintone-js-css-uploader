import type * as types from "@/types";
import type { AxiosResponse } from "axios";
import type { FileUploadResponseInfo, FileUploadRequestInfo } from "./types";

import * as rest from "../rest";
import { JsCssUploaderConfig } from "./classes/Config";

type ApiConfig = { host: string; username: string; password: string };

/**
 * kintoneJsUpAsync
 * @param {ApiConfig} apiConfig
 * @param  {types.KintoneJsCssUploaderConfig} config
 * @param {types.KintoneJsCssUploderMode} mode
 * @returns {Promise<AxiosResponse>}
 */
export const jsCssUploaderAsync = async (
  apiConfig: ApiConfig,
  config: types.KintoneJsCssUploaderConfig,
  mode: types.KintoneJsCssUploderMode
): Promise<AxiosResponse> => {
  const objConfig = new JsCssUploaderConfig(config, mode);

  const entry = objConfig.entry;

  if (entry === undefined) {
    throw new Error(`config[${mode}] is undefined.`);
  }

  const allRess = await allFileUploadAsync(apiConfig, objConfig);
};

const allFileUploadAsync = async (
  apiConfig: ApiConfig,
  objConfig: JsCssUploaderConfig
) => {
  const requests = [];
  requests.push(...objConfig.createFileUploadRequest("desktop"));
  requests.push(...objConfig.createFileUploadRequest("mobile"));

  const promises = requests.map((request: FileUploadRequestInfo) => {
    const { host, username, password } = apiConfig;
    const { target, kind, filePaths } = request;

    return rest
      .fileUploadAsync({ host, username, password, filePaths })
      .then((responses) => {
        const res: FileUploadResponseInfo = {
          target,
          kind,
          responses,
        };
        return res;
      });
  });

  return await Promise.all(promises);
};
