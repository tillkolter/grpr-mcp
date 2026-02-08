export type HunchLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export type HunchSourceKind = "sdk" | "stdout" | "stderr" | "mcp";

export type HunchSource = {
  kind: HunchSourceKind;
  file?: string;
  line?: number;
  backend?: string;
  backend_id?: string;
};

export type HunchSdkConfig = {
  enabled: boolean;
  capture_stdout: boolean;
  capture_stderr: boolean;
};

export type HunchEvent = {
  id: string;
  ts: string;
  level: HunchLevel;
  type: string;
  service: string;
  run_id: string;
  session_id?: string;
  message?: string;
  data?: Record<string, unknown>;
  tags?: Record<string, string>;
  trace_id?: string;
  span_id?: string;
  source?: HunchSource;
};

export type HunchConfig = {
  version: 1;
  enabled: boolean;
  store_dir: string;
  default_service: string;
  sdk: HunchSdkConfig;
  read?: HunchReadConfig;
  redaction: {
    enabled: boolean;
    keys: string[];
    patterns: string[];
  };
  mcp: {
    max_results: number;
    default_lookback_ms: number;
  };
};

export type HunchReadBackendType = "local" | "cloudwatch" | "k8s";

export type LocalReadBackendConfig = {
  type: "local";
  id?: string;
  dir?: string;
};

export type CloudWatchReadBackendConfig = {
  type: "cloudwatch";
  id?: string;
  logGroup: string;
  region: string;
  profile?: string;
  service?: string;
};

export type K8sReadBackendConfig = {
  type: "k8s";
  id?: string;
  namespace: string;
  selector: string;
  context?: string;
  container?: string;
  service?: string;
};

export type HunchReadBackendConfig =
  | LocalReadBackendConfig
  | CloudWatchReadBackendConfig
  | K8sReadBackendConfig;

export type HunchReadConfig = {
  backend: "local" | "multi";
  backends?: HunchReadBackendConfig[];
};

export type HunchSearchParams = {
  service?: string;
  session_id?: string;
  run_id?: string;
  types?: string[];
  levels?: HunchLevel[];
  contains?: string;
  since?: string;
  until?: string;
  limit?: number;
  backends?: string[];
  config_path?: string;
};

export type HunchStatsParams = {
  service?: string;
  session_id?: string;
  since?: string;
  until?: string;
  group_by: "type" | "level" | "stage";
  limit?: number;
  backends?: string[];
  config_path?: string;
};

export type HunchSessionsParams = {
  service?: string;
  since?: string;
  limit?: number;
  backends?: string[];
  config_path?: string;
};

export type HunchTailParams = {
  service?: string;
  session_id?: string;
  run_id?: string;
  limit?: number;
  backends?: string[];
  config_path?: string;
};
