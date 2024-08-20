import rest from "./rest";

import type { AxiosResponse } from "axios";
import type * as types from "@/types";

const convertRequest = (
  entry: types.KintoneJsCssUploaderEntry
): types.kintone.rest.Customize.RestRequest => {
  return {
    app: entry.app,
    scope: entry.scope,
    desktop: entry.desktop ? {} : undefined,
    mobile: entry.mobile ? {} : undefined,
  };
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

/**
 * kintoneJsUpAsync
 * @param {{host:string, username:string, password: string}} apiConfig
 * @param {string} filePath
 * @returns {Promise<AxiosResponse>}
 */
export const jscssUploaderAsync = async (
  apiConfig: { host: string; username: string; password: string },
  entry: types.KintoneJsCssUploaderEntry
): Promise<AxiosResponse> => {
  const { host, username, password } = apiConfig;

  const json = convertRequest(entry);

  const res = await Promise.all(
    (["desktop", "mobile"] as const)
      .map((entryName) => {
        const subEntry = parseEntry(entry, entryName);
        return subEntry;
      })
      .filter((v) => v !== undefined)
      .map((subEntry: types.KintoneJsCssUploaderEntryKind) => {
        return (["js", "css"] as const).map(async (p) => {
          const prop = subEntry[p];
        });
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
