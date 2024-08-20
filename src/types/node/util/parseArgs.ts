import type { ParseArgsConfig } from "node:util";

export type CommandArgsConfig = ParseArgsConfig & {
  [param: string]: object;
};
