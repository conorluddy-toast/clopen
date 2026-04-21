import { homedir } from "node:os";
import { join } from "node:path";

export const configDir = (): string => {
  const xdg = process.env.XDG_CONFIG_HOME;
  return xdg ? join(xdg, "clopen") : join(homedir(), ".config", "clopen");
};

export const presetsPath = (): string => join(configDir(), "presets.json");
