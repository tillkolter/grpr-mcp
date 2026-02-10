import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type GuckIngestRegistryEntry = {
  version: number;
  pid: number;
  root_dir: string;
  config_path?: string;
  host: string;
  path: string;
  port: number;
  started_at: string;
  session_id?: string;
};

type RegistryOptions = {
  rootDir: string;
  configPath?: string;
  host: string;
  path: string;
  port: number;
  sessionId?: string;
  registryDir?: string;
};

const DEFAULT_REGISTRY_DIR = path.join(os.homedir(), ".guck", "ingest");

const resolveRegistryDir = (override?: string): string => {
  if (override) {
    return override;
  }
  if (process.env.GUCK_INGEST_REGISTRY_DIR) {
    return process.env.GUCK_INGEST_REGISTRY_DIR;
  }
  return DEFAULT_REGISTRY_DIR;
};

const writeAtomic = (filePath: string, contents: string): void => {
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, contents);
  fs.renameSync(tmpPath, filePath);
};

const safeUnlink = (filePath: string): void => {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // Best effort cleanup.
  }
};

const registerCleanup = (filePath: string): (() => void) => {
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) {
      return;
    }
    cleaned = true;
    safeUnlink(filePath);
  };

  process.once("exit", cleanup);

  const rethrow = (signal: NodeJS.Signals) => {
    cleanup();
    process.off(signal, rethrow);
    process.kill(process.pid, signal);
  };

  process.on("SIGINT", rethrow);
  process.on("SIGTERM", rethrow);

  return cleanup;
};

export const writeIngestRegistryEntry = (
  options: RegistryOptions,
): { filePath: string; dispose: () => void } => {
  const registryDir = resolveRegistryDir(options.registryDir);
  fs.mkdirSync(registryDir, { recursive: true });
  const instanceId = randomUUID();
  const filePath = path.join(registryDir, `${instanceId}.json`);
  const payload: GuckIngestRegistryEntry = {
    version: 1,
    pid: process.pid,
    root_dir: options.rootDir,
    config_path: options.configPath,
    host: options.host,
    path: options.path,
    port: options.port,
    started_at: new Date().toISOString(),
    session_id: options.sessionId,
  };
  writeAtomic(filePath, JSON.stringify(payload, null, 2));
  const dispose = registerCleanup(filePath);
  return { filePath, dispose };
};

export const updateIngestRegistryEntry = (
  filePath: string,
  patch: { root_dir: string; config_path?: string },
): boolean => {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<GuckIngestRegistryEntry>;
    if (!parsed || typeof parsed !== "object") {
      return false;
    }
    const next: GuckIngestRegistryEntry = {
      version: typeof parsed.version === "number" ? parsed.version : 1,
      pid: typeof parsed.pid === "number" ? parsed.pid : process.pid,
      root_dir: patch.root_dir,
      config_path: patch.config_path,
      host: typeof parsed.host === "string" ? parsed.host : "127.0.0.1",
      path: typeof parsed.path === "string" ? parsed.path : "/guck/emit",
      port: typeof parsed.port === "number" ? parsed.port : 0,
      started_at: typeof parsed.started_at === "string" ? parsed.started_at : new Date().toISOString(),
      session_id: typeof parsed.session_id === "string" ? parsed.session_id : undefined,
    };
    writeAtomic(filePath, JSON.stringify(next, null, 2));
    return true;
  } catch {
    return false;
  }
};
