import rest from "./rest";
import util from "@/lib/util";

import { type AxiosResponse } from "axios";
import type * as types from "@/types";

/**
 * kintoneJsUpAsync
 * @param {{host:string, username:string, password: string}} apiConfig
 * @param  {types.KintoneJsCssUploaderConfig} config
 * @param {types.KintoneJsCssUploderMode} mode
 * @returns {Promise<AxiosResponse>}
 */
export const jscssUploaderAsync = async (
  apiConfig: { host: string; username: string; password: string },
  config: types.KintoneJsCssUploaderConfig,
  mode: types.KintoneJsCssUploderMode
): Promise<AxiosResponse> => {
  const { host, username, password } = apiConfig;

  const objConfig = new Config(config, mode);

  const entry = objConfig.entry;

  if (entry === undefined) {
    throw new Error(`config[${mode}] is undefined.`);
  }

  const reqInfo = objConfig
    .convertFileUploadRequest("desktop")
    .concat(objConfig.convertFileUploadRequest("mobile"));

  const allRes: FileUploadResponseInfo[] = await Promise.all(
    reqInfo.map((req: FileUploadRequestInfo) => {
      const { target, kind, filePaths } = req;

      return rest
        .fileUploadAsync({
          host,
          username,
          password,
          filePaths,
        })
        .then((responses) => {
          return {
            target,
            kind,
            responses,
          };
        });
    })
  );

  const json: types.kintone.rest.Customize.RestRequest =
    objConfig.convertRequest(allRes);

  return await Promise.all(
    allRes.map((res) => {
      const { responses } = res;

      const json: types.kintone.rest.Customize.RestRequest =
        objConfig.convertRequest(responses);
    })
  );

  if (config[mode]) {
    const entry: types.KintoneJsCssUploaderEntry = config[mode];
    const json = convertRequest(entry);

    for (const subEntryName of ["desktop", "mobile"] as const) {
      const subEntry = parseEntry(entry, subEntryName);

      if (subEntry !== undefined) {
        for (const p of ["js", "css"] as const) {
          if (subEntry[p] !== undefined) {
            const filePaths = subEntry[p] as string[];
            const fuRes: AxiosResponse = await rest.fileUploadAsync({
              host,
              username,
              password,
              filePaths,
            });
            const datas = (
              Array.isArray(fuRes.data) ? fuRes.data : [fuRes.data]
            ) as types.kintone.rest.FileUpload.RestResponse[];

            if (0 < datas.length) {
              if (!json[subEntryName]) {
                json[subEntryName] = {};
              }
              json[subEntryName][p] = datas.map((d) => {
                return {
                  type: "FILE" as const,
                  file: { fileKey: d.fileKey },
                };
              });
            }
          }
        }
      }
    }
  }

  const cRes: AxiosResponse = await rest.customizeAsync({
    host,
    username,
    password,
    json,
  });

  return cRes;
};

type Uploader = {
  target: "desktop" | "mobile";
  kind: "js" | "css";
};

type FileUploadRequestInfo = {
  target: Uploader["target"];
  kind: Uploader["kind"];
  filePaths: string[];
};

type FileUploadResponseInfo = {
  target: Uploader["target"];
  kind: Uploader["kind"];
  responses: AxiosResponse[];
};

class Config {
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

  convertRequest(
    ress: FileUploadResponseInfo[]
  ): types.kintone.rest.Customize.RestRequest {
    const entry = this.#entry;
    const { app, scope } = entry;
    const req = util.deepClone({
      app,
      scope,
    });

    ress.forEach((res) => {
      const { target, kind, responses } = res;
    });

    return util.deepClone({
      app,
      scope,
      desktop: desktop ? {} : undefined,
      mobile: mobile ? {} : undefined,
    });
  }

  convertFileUploadRequest(
    target: Uploader["target"]
  ): FileUploadRequestInfo[] {
    const fileInfos: types.KintoneJsCssUploaderEntryFilePaths[] =
      this.#parseEntry(target);

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

const convertRequest = (
  entry: types.KintoneJsCssUploaderEntry
): types.kintone.rest.Customize.RestRequest => {
  const { app, scope, desktop, mobile } = entry;
  return util.deepClone({
    app,
    scope,
    desktop: desktop ? {} : undefined,
    mobile: mobile ? {} : undefined,
  });
};

const parseEntry = (
  entry: types.KintoneJsCssUploaderEntry,
  kind: "desktop" | "mobile"
) => {
  if (typeof entry[kind] === "boolean") {
    if (entry[kind] === true) {
      if (kind === "desktop") {
        return typeof entry.mobile === "boolean" ? undefined : entry.mobile;
      } else {
        return typeof entry.desktop === "boolean" ? undefined : entry.desktop;
      }
    } else {
      return undefined;
    }
  } else {
    return entry[kind];
  }
};
