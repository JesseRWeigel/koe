import { neon } from "@neondatabase/serverless";

export interface SqlExecutor {
  query<T extends Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<T[]>;
}

export interface AiQuotaStore {
  acquire(subjectHash: string, leaseId: string): Promise<AiQuotaDecision>;
  release(lease: AiQuotaLease): Promise<void>;
}

export interface AiQuotaLease {
  subjectHash: string;
  leaseId: string;
}

export type AiQuotaDecision =
  | { allowed: true; lease: AiQuotaLease }
  | { allowed: false; retryAfterSeconds: number };

interface QuotaOptions {
  maxRequests: number;
  windowMs: number;
  leaseMs: number;
}

interface AcquiredRow extends Record<string, unknown> {
  lease_id: string;
}

interface StateRow extends Record<string, unknown> {
  window_retry_ms: number | string;
  lease_retry_ms: number | string;
  request_count: number;
}

export const createAiBudgetTableSql = `
CREATE TABLE IF NOT EXISTS ai_route_budgets (
  subject_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count >= 0),
  lease_id text,
  lease_expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

const acquireSql = `
INSERT INTO ai_route_budgets (
  subject_hash, window_started_at, request_count,
  lease_id, lease_expires_at, updated_at
)
VALUES (
  $1, now(), 1, $2,
  now() + ($5::double precision * interval '1 millisecond'),
  now()
)
ON CONFLICT (subject_hash) DO UPDATE SET
  window_started_at = CASE
    WHEN ai_route_budgets.window_started_at <=
      now() - ($4::double precision * interval '1 millisecond')
    THEN now()
    ELSE ai_route_budgets.window_started_at
  END,
  request_count = CASE
    WHEN ai_route_budgets.window_started_at <=
      now() - ($4::double precision * interval '1 millisecond')
    THEN 1
    ELSE ai_route_budgets.request_count + 1
  END,
  lease_id = EXCLUDED.lease_id,
  lease_expires_at = EXCLUDED.lease_expires_at,
  updated_at = now()
WHERE
  (
    ai_route_budgets.window_started_at <=
      now() - ($4::double precision * interval '1 millisecond')
    OR ai_route_budgets.request_count < $3
  )
  AND (
    ai_route_budgets.lease_id IS NULL
    OR ai_route_budgets.lease_expires_at <= now()
  )
RETURNING lease_id`;

const stateSql = `
SELECT
  request_count,
  GREATEST(
    0,
    EXTRACT(epoch FROM (
      window_started_at
      + ($2::double precision * interval '1 millisecond')
      - now()
    )) * 1000
  ) AS window_retry_ms,
  GREATEST(
    0,
    EXTRACT(epoch FROM (lease_expires_at - now())) * 1000
  ) AS lease_retry_ms
FROM ai_route_budgets
WHERE subject_hash = $1`;

const releaseSql = `
UPDATE ai_route_budgets
SET lease_id = NULL, lease_expires_at = NULL, updated_at = now()
WHERE subject_hash = $1 AND lease_id = $2`;

export class PostgresAiQuotaStore {
  constructor(
    private readonly executor: SqlExecutor,
    private readonly options: QuotaOptions = {
      maxRequests: 30,
      windowMs: 10 * 60_000,
      leaseMs: 35_000,
    },
  ) {}

  async acquire(subjectHash: string, leaseId: string): Promise<AiQuotaDecision> {
    const rows = await this.executor.query<AcquiredRow>(acquireSql, [
      subjectHash,
      leaseId,
      this.options.maxRequests,
      this.options.windowMs,
      this.options.leaseMs,
    ]);
    if (rows.length > 0) {
      return {
        allowed: true,
        lease: { subjectHash, leaseId: rows[0].lease_id },
      };
    }

    const state = await this.executor.query<StateRow>(stateSql, [
      subjectHash,
      this.options.windowMs,
    ]);
    const row = state[0];
    const retryMs = row
      ? Math.max(
          Number(row.request_count) >= this.options.maxRequests
            ? Number(row.window_retry_ms)
            : 0,
          Number(row.lease_retry_ms),
        )
      : 1_000;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryMs / 1000)),
    };
  }

  async release(lease: AiQuotaLease): Promise<void> {
    await this.executor.query(releaseSql, [
      lease.subjectHash,
      lease.leaseId,
    ]);
  }
}

export function createNeonQuotaStore(databaseUrl: string): PostgresAiQuotaStore {
  const sql = neon(databaseUrl);
  const executor: SqlExecutor = {
    async query<T extends Record<string, unknown>>(
      text: string,
      params: unknown[] = [],
    ): Promise<T[]> {
      return (await sql.query(text, params)) as T[];
    },
  };
  return new PostgresAiQuotaStore(executor);
}
