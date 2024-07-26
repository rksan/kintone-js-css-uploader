export type CustomizeRestResponse = {
  revision?: string;
};

export type FileUploadRestRequest = {
  app: string;
  scope?: "ALL" | "ADMIN" | "NONE";
  desktop?: {
    js?: [{ type?: "URL" | "FILE"; url?: string; file?: { fileKey: string } }];
    css?: [{ type?: "URL" | "FILE"; url?: string; file?: { fileKey: string } }];
  };
  mobile?: {
    js?: [{ type?: "URL" | "FILE"; url?: string; file?: { fileKey: string } }];
    css?: [{ type?: "URL" | "FILE"; url?: string; file?: { fileKey: string } }];
  };
  revision?: number | string;
};

export type FileUploadRestResponse = {
  fileKey?: string;
};
