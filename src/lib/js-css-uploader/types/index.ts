import type { AxiosResponse } from "axios";

export type FileUploaderProperty = {
  target: "desktop" | "mobile";
  kind: "js" | "css";
};

export type FileUploaderRequestInfo = {
  target: FileUploaderProperty["target"];
  kind: FileUploaderProperty["kind"];
  filePaths: string[];
};

export type FileUploaderResponseInfo = {
  target: FileUploaderProperty["target"];
  kind: FileUploaderProperty["kind"];
  responses: AxiosResponse[];
};
