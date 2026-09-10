import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import {
  PostgresAiQuotaStore,
  createAiBudgetTableSql,
  type SqlExecutor,
} from "./quota-store";

describe("PostgresAiQuotaStore", () => {
  let db: PGlite;
  let store: PostgresAiQuotaStore;

  beforeEach(async () => {
    db = new PGlite();
    await db.exec(createAiBudgetTableSql);
    const executor: SqlExecutor = {
      async query<T extends Record<string, unknown>>(
        text: string,
        params: unknown[] = [],
      ): Promise<T[]> {
        const result = await db.query<T>(text, params);
        return result.rows;
      },
    };
    store = new PostgresAiQuotaStore(executor, {
      maxRequests: 2,
      windowMs: 60_000,
      leaseMs: 100,
    });
  });

  afterEach(async () => {
    await db.close();
  });

  it("atomically shares one concurrency lease across sibling routes", async () => {
    const [a, b] = await Promise.all([
      store.acquire("same-user", "lease-chat"),
      store.acquire("same-user", "lease-grammar"),
    ]);
    expect([a.allowed, b.allowed].sort()).toEqual([false, true]);
  });

  it("shares the fixed-window request budget after releases", async () => {
    const first = await store.acquire("same-user", "lease-1");
    expect(first.allowed).toBe(true);
    if (first.allowed) await store.release(first.lease);
    const second = await store.acquire("same-user", "lease-2");
    expect(second.allowed).toBe(true);
    if (second.allowed) await store.release(second.lease);
    await expect(store.acquire("same-user", "lease-3"))
      .resolves.toMatchObject({ allowed: false });
  });

  it("reclaims expired leases", async () => {
    await store.acquire("same-user", "old-lease");
    await new Promise((resolve) => setTimeout(resolve, 125));
    await expect(store.acquire("same-user", "new-lease"))
      .resolves.toMatchObject({ allowed: true, lease: { leaseId: "new-lease" } });
  });

  it("does not let a late old release clear a newer lease", async () => {
    await store.acquire("same-user", "old-lease");
    await new Promise((resolve) => setTimeout(resolve, 125));
    const current = await store.acquire("same-user", "new-lease");
    expect(current.allowed).toBe(true);
    await store.release({ subjectHash: "same-user", leaseId: "old-lease" });
    await expect(store.acquire("same-user", "third-lease"))
      .resolves.toMatchObject({ allowed: false });
  });
});