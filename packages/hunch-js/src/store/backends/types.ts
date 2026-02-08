import {
  HunchEvent,
  HunchSearchParams,
  HunchStatsParams,
  HunchSessionsParams,
} from "../../schema.js";

export type SearchResult = { events: HunchEvent[]; truncated: boolean };
export type StatsResult = { buckets: Array<{ key: string; count: number }> };
export type SessionsResult = {
  sessions: Array<{ session_id: string; last_ts: string; event_count: number; error_count: number }>;
};

export type ReadBackend = {
  search: (params: HunchSearchParams) => Promise<SearchResult>;
  stats: (params: HunchStatsParams) => Promise<StatsResult>;
  sessions: (params: HunchSessionsParams) => Promise<SessionsResult>;
};
