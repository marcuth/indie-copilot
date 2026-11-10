import { invoke } from "@tauri-apps/api/core"

export type SqlValue = string | number | boolean | null

export interface SqlStatement {
    sql: string
    params?: SqlValue[]
}

export type SqlRow = Record<string, unknown>

export function dbSelect(
    sql: string,
    params: SqlValue[] = [],
): Promise<SqlRow[]> {
    return invoke<SqlRow[]>("db_select", { sql, params })
}

export function dbExecute(
    sql: string,
    params: SqlValue[] = [],
): Promise<number> {
    return invoke<number>("db_execute", { sql, params })
}

/** Executa as instruções em uma única transação (tudo ou nada). */
export function dbBatch(statements: SqlStatement[]): Promise<void> {
    return invoke<void>("db_batch", { statements })
}

function columnsOf(row: Record<string, SqlValue>): string[] {
    return Object.keys(row)
}

/** INSERT ... ON CONFLICT DO UPDATE (nunca REPLACE, que apagaria os filhos em cascata). */
export function upsertStatement(
    table: string,
    row: Record<string, SqlValue>,
    key = "id",
): SqlStatement {
    const columns = columnsOf(row)
    const updates = columns
        .filter((column) => column !== key)
        .map((column) => `${column} = excluded.${column}`)

    return {
        sql: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns
            .map((_, index) => `?${index + 1}`)
            .join(
                ", ",
            )}) ON CONFLICT(${key}) DO UPDATE SET ${updates.join(", ")}`,
        params: columns.map((column) => row[column]),
    }
}

/** INSERT OR IGNORE: usado na migração para nunca sobrescrever dados já gravados. */
export function insertIgnoreStatement(
    table: string,
    row: Record<string, SqlValue>,
): SqlStatement {
    const columns = columnsOf(row)

    return {
        sql: `INSERT OR IGNORE INTO ${table} (${columns.join(", ")}) VALUES (${columns
            .map((_, index) => `?${index + 1}`)
            .join(", ")})`,
        params: columns.map((column) => row[column]),
    }
}
