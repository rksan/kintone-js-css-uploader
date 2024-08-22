import type * as types from "@/types";
import type { AxiosResponse } from "axios";
import type {
  FileUploaderResponseInfo,
  FileUploaderRequestInfo,
} from "./types";

import * as rest from "../kintone/rest";
import { JsCssUploaderConfig } from "./classes/Config";

/**
 * kintoneJsUpAsync
 * call kintone Fileupload API
 *  -> call kintone Customize API
 *   -> return kintone Customize API Response
 * @see https://cybozu.dev/ja/kintone/docs/rest-api/apps/settings/update-customization/#update-customization
 * @param {types.JsCssUploader.Auth} apiConfig
 * @param  {types.JsCssUploader.Config} config
 * @param {types.JsCssUploader.Mode} mode
 * @returns {Promise<AxiosResponse>}
 */
export const jsCssUploaderAsync = async (
  apiConfig: types.JsCssUploader.Auth,
  config: types.JsCssUploader.Config,
  mode: types.JsCssUploader.Mode
): Promise<AxiosResponse> => {
  const objConfig = new JsCssUploaderConfig(config, mode);

  const entry = objConfig.entry;

  if (entry === undefined) {
    throw new Error(`config[${mode}] is undefined.`);
  }

  const resInfos = await allFileUploadAsync(apiConfig, objConfig);

  const response = await allCustomizeAsync(apiConfig, objConfig, resInfos);

  return response;
};

const allCustomizeAsync = async (
  apiConfig: types.JsCssUploader.Auth,
  objConfig: JsCssUploaderConfig,
  resInfos: FileUploaderResponseInfo[]
): Promise<AxiosResponse> => {
  const request = objConfig.createCustomizeRequest(resInfos);
  const json = request as object;

  const { host, username, password } = apiConfig;
  const response = await rest.customizeAsync({
    host,
    username,
    password,
    json,
  });

  return response;
};

const allFileUploadAsync = async (
  apiConfig: types.JsCssUploader.Auth,
  objConfig: JsCssUploaderConfig
): Promise<FileUploaderResponseInfo[]> => {
  const requests = [];
  requests.push(...objConfig.createFileUploadRequest("desktop"));
  requests.push(...objConfig.createFileUploadRequest("mobile"));

  const promises = requests.map(async (request: FileUploaderRequestInfo) => {
    const { host, username, password } = apiConfig;
    const { target, kind, filePaths } = request;

    const responses = await rest.fileUploadAsync({
      host,
      username,
      password,
      filePaths,
    });

    const resInfo: FileUploaderResponseInfo = {
      target,
      kind,
      responses,
    };

    return resInfo;
  });

  const resInfos = await Promise.all(promises);

  return resInfos;
};
