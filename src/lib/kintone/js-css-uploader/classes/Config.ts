import util from "@/lib/util";

import type * as types from "@/types";
import {
  Uploader,
  FileUploadRequestInfo,
  FileUploadResponseInfo,
} from "../types";

export class JsCssUploaderConfig {
  #config: types.KintoneJsCssUploaderConfig;
  #mode: types.KintoneJsCssUploderMode;
  #entry: types.KintoneJsCssUploaderEntry;

  constructor(
    config: types.KintoneJsCssUploaderConfig,
    mode: types.KintoneJsCssUploderMode
  ) {
    this.#config = config;
    this.#mode = mode;
    this.#entry = this.#loadEntry(this.#config, this.#mode);
  }

  get entry(): types.KintoneJsCssUploaderEntry {
    return this.#entry;
  }

  /**
   * kintone REST API Customize Requast Dataを作成
   * @param {FileUploadResponseInfo[]} resInfos
   * @returns {types.kintone.rest.Customize.RestRequest}
   */
  createCustomizeRequest(
    resInfos: FileUploadResponseInfo[]
  ): types.kintone.rest.Customize.RestRequest {
    const entry = this.#entry;
    const { app, scope } = entry;

    const req: types.kintone.rest.Customize.RestRequest = util.deepClone({
      app,
      scope,
    });

    resInfos.forEach((info) => {
      const { target, kind, responses } = info;
      responses.forEach((res) => {
        const data = res.data as types.kintone.rest.FileUpload.RestResponse;
        const { fileKey } = data;

        if (!req[target]) req[target] = {};
        if (!req[target][kind]) req[target][kind] = [];

        req[target][kind].push({ type: "FILE", file: { fileKey } });
      });
    });

    return req;
  }

  createFileUploadRequest(target: Uploader["target"]): FileUploadRequestInfo[] {
    const fileInfos: types.KintoneJsCssUploaderEntryFilePaths[] = [];

    fileInfos.push(...this.#parseEntry(target));

    const reqs: FileUploadRequestInfo[] = [];

    fileInfos.forEach((info: types.KintoneJsCssUploaderEntryFilePaths) => {
      (["js", "css"] as const)
        .map((kind): FileUploadRequestInfo | undefined => {
          return info[kind]
            ? { target, kind, filePaths: info[kind] }
            : undefined;
        })
        .filter((r) => r !== undefined)
        .forEach((req: FileUploadRequestInfo) => reqs.push(req));
    });

    return reqs;
  }

  #parseEntry(
    target: Uploader["target"]
  ): types.KintoneJsCssUploaderEntryFilePaths[] {
    const entry = this.#entry;
    const filesInfo: types.KintoneJsCssUploaderEntryFilePaths[] = [];

    const files = entry[target];

    if (files === false || files === undefined) {
      // none.
    } else if (files === true) {
      const other = target === "desktop" ? entry["mobile"] : entry["desktop"];
      if (typeof other !== "boolean" && other !== undefined) {
        filesInfo.push(other);
      }
    } else {
      filesInfo.push(files);
    }

    return filesInfo;
  }

  #loadEntry(
    config: types.KintoneJsCssUploaderConfig,
    mode: types.KintoneJsCssUploderMode
  ): types.KintoneJsCssUploaderEntry {
    let entry = config[mode];
    const excludes = [mode];

    for (;;) {
      if (!entry) break;
      if (typeof entry.extends !== "string") break;

      const mode = entry.extends;

      if (excludes.includes(mode)) break;

      excludes.push(mode);
      const ext = config[mode];

      if (ext === undefined) break;

      entry = Object.assign(entry, ext);
    }

    if (entry === undefined) {
      throw new Error(`js-css-uploader's config[${mode}] is undefined.`);
    }

    return entry;
  }
}
