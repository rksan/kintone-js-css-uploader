import util from "@/lib/util";

import type * as types from "@/types";
import {
  FileUploaderProperty,
  FileUploaderRequestInfo,
  FileUploaderResponseInfo,
} from "../types";

export class JsCssUploaderConfig {
  #config: types.JsCssUploader.Config;
  #mode: types.JsCssUploader.Mode;
  #entry: types.JsCssUploader.Entry;

  constructor(
    config: types.JsCssUploader.Config,
    mode: types.JsCssUploader.Mode
  ) {
    this.#config = config;
    this.#mode = mode;
    this.#entry = this.#loadEntry(this.#config, this.#mode);
  }

  get entry(): types.JsCssUploader.Entry {
    return this.#entry;
  }

  /**
   * kintone REST API Customize Requast Dataを作成
   * @param {FileUploadResponseInfo[]} resInfos
   * @returns {types.kintone.rest.Customize.RestRequest}
   */
  createCustomizeRequest(
    resInfos: FileUploaderResponseInfo[]
  ): types.kintone.rest.Customize.RestRequest {
    const entry = this.#entry;
    const { app, scope } = entry;

    const request: types.kintone.rest.Customize.RestRequest = util.deepClone({
      app,
      scope,
    });

    resInfos.forEach((info) => {
      const { target, kind, responses } = info;
      responses.forEach((res) => {
        const data = res.data as types.kintone.rest.FileUpload.RestResponse;
        const { fileKey } = data;

        if (!request[target]) request[target] = {};
        if (!request[target][kind]) request[target][kind] = [];

        request[target][kind].push({ type: "FILE", file: { fileKey } });
      });
    });

    return request;
  }

  createFileUploadRequest(
    target: FileUploaderProperty["target"]
  ): FileUploaderRequestInfo[] {
    const fileInfos: types.JsCssUploader.FilePaths[] = [];

    fileInfos.push(...this.#parseEntry(target));

    const reqs: FileUploaderRequestInfo[] = [];

    fileInfos.forEach((info: types.JsCssUploader.FilePaths) => {
      (["js", "css"] as const)
        .map((kind): FileUploaderRequestInfo | undefined => {
          return info[kind]
            ? { target, kind, filePaths: info[kind] }
            : undefined;
        })
        .filter((r) => r !== undefined)
        .forEach((req: FileUploaderRequestInfo) => reqs.push(req));
    });

    return reqs;
  }

  #parseEntry(
    target: FileUploaderProperty["target"]
  ): types.JsCssUploader.FilePaths[] {
    const entry = this.#entry;
    const filesInfo: types.JsCssUploader.FilePaths[] = [];

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
    config: types.JsCssUploader.Config,
    mode: types.JsCssUploader.Mode
  ): types.JsCssUploader.Entry {
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
