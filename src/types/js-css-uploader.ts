export type KintoneJsCssUploderMode = "dev" | "test" | "prod";

export type KintoneJsCssUploaderConfig = {
  [mode in KintoneJsCssUploderMode]?: KintoneJsCssUploaderEntry;
};

export type KintoneJsCssUploaderEntryFilePaths = {
  js?: string[];
  css?: string[];
};

export type KintoneJsCssUploaderEntry = {
  extends?: KintoneJsCssUploderMode;
  app: string | number;
  scope: "ALL" | "ADMIN" | "NONE";
  desktop?: boolean | KintoneJsCssUploaderEntryFilePaths;
  mobile?: boolean | KintoneJsCssUploaderEntryFilePaths;
  exec?: string[];
};
