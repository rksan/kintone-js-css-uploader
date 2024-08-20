export type KintoneJsCssUploaderEntryKind = {
  js?: string[];
  css?: string[];
};
export type KintoneJsCssUploaderEntry = {
  extends?: "dev" | "test" | "prod";
  app: string | number;
  scope: "ALL" | "ADMIN" | "NONE";
  desktop?: boolean | KintoneJsCssUploaderEntryKind;
  mobile?: boolean | KintoneJsCssUploaderEntryKind;
  exec?: string[];
};
export type KintoneJsCssUploaderConfig = {
  dev?: KintoneJsCssUploaderEntry;
  test?: KintoneJsCssUploaderEntry;
  prod?: KintoneJsCssUploaderEntry;
};
