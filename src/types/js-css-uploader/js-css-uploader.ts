export type Auth = { host: string; username: string; password: string };

export type Mode = "dev" | "test" | "prod";

export type FilePaths = {
  js?: string[];
  css?: string[];
};

export type Entry = {
  extends?: Mode;
  app: string | number;
  scope?: "ALL" | "ADMIN" | "NONE";
  desktop?: boolean | FilePaths;
  mobile?: boolean | FilePaths;
  exec?: string[];
};

export type Config = {
  [mode in Mode]?: Entry;
};
