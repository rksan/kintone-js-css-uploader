import type { AxiosResponse } from "axios";

export type Uploader = {
  target: "desktop" | "mobile";
  kind: "js" | "css";
};

export type FileUploadRequestInfo = {
  target: Uploader["target"];
  kind: Uploader["kind"];
  filePaths: string[];
};

export type FileUploadResponseInfo = {
  target: Uploader["target"];
  kind: Uploader["kind"];
  responses: AxiosResponse[];
};
