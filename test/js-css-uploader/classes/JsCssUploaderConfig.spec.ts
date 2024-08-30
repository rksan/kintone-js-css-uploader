import { describe, it } from "mocha";
import { assert } from "chai";
import AppRootPath from "app-root-path";

import type * as types from "@/types";
import { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
// test target
import type { FileUploaderResponseInfo } from "@/lib/js-css-uploader/types";
import { JsCssUploaderConfig } from "@/lib/js-css-uploader/classes/JsCssUploaderConfig";

describe("JsCssUploaderConfig.ts", () => {
  const json = AppRootPath.require("/.kjcurc.js") as object;
  const config: types.JsCssUploader.Config = json;

  describe("JsCssUploaderConfig", () => {
    it("new", () => {
      const dev = new JsCssUploaderConfig(config, "dev");
      assert.isOk(dev !== undefined);
      if (config.dev) {
        assert.isOk(dev.entry.app === config.dev.app);
        assert.isOk(dev.entry.scope === config.dev.scope);
        if (
          dev.entry.desktop &&
          typeof dev.entry.desktop !== "boolean" &&
          Array.isArray(dev.entry.desktop.js)
        ) {
          dev.entry.desktop.js.forEach((fp) => {
            assert.isOk(typeof fp === "string");
          });
        }
      }

      (["test", "prod"] as const).forEach((mode) => {
        const upconfig = new JsCssUploaderConfig(config, mode);
        assert.isOk(upconfig !== undefined);
        assert.isOk(config[mode] && config.dev);
        if (config[mode] && config.dev) {
          assert.isOk(upconfig.entry.app === config[mode].app);
          assert.isOk(upconfig.entry.scope === config.dev.scope);
          if (typeof upconfig.entry.desktop !== "boolean") {
            if (
              upconfig.entry.desktop !== undefined &&
              upconfig.entry.desktop.js !== undefined
            ) {
              upconfig.entry.desktop.js.forEach((fp) =>
                assert.isOk(typeof fp === "string")
              );
            }
          }
        }
      });
    });

    it("createFileUploadRequest()", () => {
      const dev = new JsCssUploaderConfig(config, "dev");
      dev.createFileUploadRequest("desktop").forEach((req) => {
        assert.isOk(req.target === "desktop");
        assert.isOk(req.kind === "js" || req.kind === "css");
        req.filePaths.forEach((fp) => assert.isOk(typeof fp === "string"));
      });
      dev.createFileUploadRequest("mobile").forEach((req) => {
        assert.isOk(req.target === "mobile");
        assert.isOk(req.kind === "js" || req.kind === "css");
        req.filePaths.forEach((fp) => assert.isOk(typeof fp === "string"));
      });
    });

    it("createCustomizeRequest()", () => {
      const dev = new JsCssUploaderConfig(config, "dev");
      const headers = new AxiosHeaders();
      const axiosConfig: InternalAxiosRequestConfig = {
        headers,
      };
      const resInfos: FileUploaderResponseInfo[] = [
        {
          target: "desktop",
          kind: "js",
          responses: [
            {
              data: { file: { fileKey: "" } },
              status: 200,
              statusText: "success",
              headers: new AxiosHeaders(),
              config: axiosConfig,
            },
          ],
        },
      ];
      const req = dev.createCustomizeRequest(resInfos);
      assert.isOk(req !== undefined);
      assert.isOk(req.app === config.dev?.app);
    });
  });
});
