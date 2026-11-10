use std::path::Path;
use std::sync::Mutex;

use rusqlite::types::{Value as SqlValue, ValueRef};
use rusqlite::{params_from_iter, Connection};
use serde::Deserialize;
use serde_json::{Map, Number, Value};

/// Conexão única do app com o SQLite, compartilhada pelos comandos Tauri.
pub struct Database(pub Mutex<Connection>);

#[derive(Debug, Deserialize)]
pub struct Statement {
    pub sql: String,
    #[serde(default)]
    pub params: Vec<Value>,
}

const SCHEMA_VERSION: i64 = 1;

const SCHEMA: &str = "
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_providers (
    id            TEXT PRIMARY KEY NOT NULL,
    name          TEXT NOT NULL,
    base_url      TEXT NOT NULL,
    api_key       TEXT,
    default_model TEXT NOT NULL,
    is_default    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id               TEXT PRIMARY KEY NOT NULL,
    name             TEXT NOT NULL,
    description      TEXT,
    website          TEXT,
    slogan           TEXT,
    already_exists   INTEGER NOT NULL DEFAULT 0,
    logo             TEXT,
    category_id      TEXT,
    problem_solution TEXT,
    target_audience  TEXT,
    business_model   TEXT,
    user_acquisition TEXT,
    marketing        TEXT,
    competition      TEXT,
    team             TEXT,
    roadmap          TEXT,
    infrastructure   TEXT,
    risks            TEXT,
    swot             TEXT,
    financials       TEXT,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id         TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project ON chat_sessions(project_id);

CREATE TABLE IF NOT EXISTS chat_messages (
    id           TEXT PRIMARY KEY NOT NULL,
    session_id   TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role         TEXT NOT NULL,
    content      TEXT NOT NULL,
    context_used TEXT,
    model_used   TEXT,
    created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

CREATE TABLE IF NOT EXISTS project_notes (
    id          TEXT PRIMARY KEY NOT NULL,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    category_id TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_project_notes_project ON project_notes(project_id);
";

pub fn open(path: &Path) -> Result<Connection, String> {
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    init(&conn)?;
    Ok(conn)
}

pub fn init(conn: &Connection) -> Result<(), String> {
    conn.execute_batch("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;")
        .map_err(|e| e.to_string())?;
    conn.execute_batch(SCHEMA).map_err(|e| e.to_string())?;
    conn.pragma_update(None, "user_version", SCHEMA_VERSION)
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn to_sql(value: &Value) -> SqlValue {
    match value {
        Value::Null => SqlValue::Null,
        Value::Bool(b) => SqlValue::Integer(i64::from(*b)),
        Value::Number(n) => match n.as_i64() {
            Some(i) => SqlValue::Integer(i),
            None => SqlValue::Real(n.as_f64().unwrap_or_default()),
        },
        Value::String(s) => SqlValue::Text(s.clone()),
        other => SqlValue::Text(other.to_string()),
    }
}

fn to_json(value: ValueRef<'_>) -> Value {
    match value {
        ValueRef::Null => Value::Null,
        ValueRef::Integer(i) => Value::Number(i.into()),
        ValueRef::Real(f) => Number::from_f64(f).map_or(Value::Null, Value::Number),
        ValueRef::Text(t) => Value::String(String::from_utf8_lossy(t).into_owned()),
        ValueRef::Blob(b) => Value::Array(b.iter().map(|byte| Value::from(*byte)).collect()),
    }
}

pub fn select(
    conn: &Connection,
    sql: &str,
    params: &[Value],
) -> Result<Vec<Map<String, Value>>, String> {
    let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
    let columns: Vec<String> = stmt.column_names().map(|c| c.to_string()).collect();

    let rows = stmt
        .query_map(params_from_iter(params.iter().map(to_sql)), |row| {
            let mut map = Map::new();
            for (index, name) in columns.iter().enumerate() {
                map.insert(name.clone(), to_json(row.get_ref(index)?));
            }
            Ok(map)
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

pub fn execute(conn: &Connection, sql: &str, params: &[Value]) -> Result<usize, String> {
    conn.execute(sql, params_from_iter(params.iter().map(to_sql)))
        .map_err(|e| e.to_string())
}

/// Executa todas as instruções em uma única transação: ou grava tudo, ou nada.
pub fn batch(conn: &mut Connection, statements: &[Statement]) -> Result<(), String> {
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    for statement in statements {
        tx.execute(
            &statement.sql,
            params_from_iter(statement.params.iter().map(to_sql)),
        )
        .map_err(|e| e.to_string())?;
    }
    tx.commit().map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn memory() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        init(&conn).unwrap();
        conn
    }

    fn project(id: &str) -> Statement {
        Statement {
            sql: "INSERT INTO projects (id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?3)"
                .into(),
            params: vec![json!(id), json!("Projeto"), json!("2026-01-01T00:00:00Z")],
        }
    }

    #[test]
    fn init_creates_schema_and_is_idempotent() {
        let conn = memory();
        init(&conn).unwrap();

        let tables = select(
            &conn,
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
            &[],
        )
        .unwrap();
        let names: Vec<&str> = tables.iter().map(|t| t["name"].as_str().unwrap()).collect();

        assert_eq!(
            names,
            vec![
                "ai_providers",
                "chat_messages",
                "chat_sessions",
                "project_notes",
                "projects",
                "settings"
            ]
        );
    }

    #[test]
    fn open_creates_a_database_file() {
        let path =
            std::env::temp_dir().join(format!("indie-copilot-test-{}.db", std::process::id()));
        let _ = std::fs::remove_file(&path);

        let conn = open(&path).unwrap();
        execute(
            &conn,
            "INSERT INTO settings (key, value) VALUES ('a', 'b')",
            &[],
        )
        .unwrap();
        drop(conn);

        let reopened = open(&path).unwrap();
        let rows = select(&reopened, "SELECT value FROM settings WHERE key = 'a'", &[]).unwrap();
        assert_eq!(rows[0]["value"], json!("b"));

        drop(reopened);
        for suffix in ["", "-wal", "-shm"] {
            let _ = std::fs::remove_file(format!("{}{}", path.display(), suffix));
        }
    }

    #[test]
    fn open_fails_for_an_invalid_path() {
        let path = std::env::temp_dir()
            .join("indie-copilot-missing-dir")
            .join("x.db");
        assert!(open(&path).is_err());
    }

    #[test]
    fn values_round_trip_with_their_types() {
        let conn = memory();
        conn.execute_batch("CREATE TABLE t (n INTEGER, f REAL, s TEXT, b BLOB, z TEXT)")
            .unwrap();

        execute(
            &conn,
            "INSERT INTO t (n, f, s, b, z) VALUES (?1, ?2, ?3, ?4, ?5)",
            &[
                json!(true),
                json!(1.5),
                json!({"a": 1}),
                json!([1, 2]),
                Value::Null,
            ],
        )
        .unwrap();
        conn.execute("UPDATE t SET b = X'0102'", []).unwrap();

        let rows = select(&conn, "SELECT n, f, s, b, z FROM t", &[]).unwrap();
        assert_eq!(rows[0]["n"], json!(1));
        assert_eq!(rows[0]["f"], json!(1.5));
        assert_eq!(rows[0]["s"], json!("{\"a\":1}"));
        assert_eq!(rows[0]["b"], json!([1, 2]));
        assert_eq!(rows[0]["z"], Value::Null);
    }

    #[test]
    fn non_finite_reals_become_null_and_large_numbers_become_reals() {
        let conn = memory();
        let rows = select(&conn, "SELECT 1e999 AS inf", &[]).unwrap();
        assert_eq!(rows[0]["inf"], Value::Null);

        let big = json!(u64::MAX);
        let rows = select(&conn, "SELECT ?1 AS v", &[big]).unwrap();
        assert!(rows[0]["v"].is_number());
    }

    #[test]
    fn select_rejects_invalid_sql() {
        assert!(select(&memory(), "SELEKT 1", &[]).is_err());
    }

    #[test]
    fn execute_reports_affected_rows_and_errors() {
        let conn = memory();
        assert_eq!(
            execute(
                &conn,
                "INSERT INTO settings (key, value) VALUES (?1, ?2)",
                &[json!("k"), json!("v")]
            )
            .unwrap(),
            1
        );
        assert!(execute(&conn, "INSERT INTO missing VALUES (1)", &[]).is_err());
    }

    #[test]
    fn batch_commits_all_statements() {
        let mut conn = memory();
        batch(&mut conn, &[project("a"), project("b")]).unwrap();

        let rows = select(&conn, "SELECT id FROM projects ORDER BY id", &[]).unwrap();
        assert_eq!(rows.len(), 2);
    }

    #[test]
    fn batch_rolls_back_everything_on_failure() {
        let mut conn = memory();
        let result = batch(&mut conn, &[project("a"), project("a")]);

        assert!(result.is_err());
        let rows = select(&conn, "SELECT id FROM projects", &[]).unwrap();
        assert!(rows.is_empty());
    }

    #[test]
    fn deleting_a_project_cascades_to_its_data() {
        let mut conn = memory();
        batch(
            &mut conn,
            &[
                project("p"),
                Statement {
                    sql: "INSERT INTO chat_sessions (id, project_id, title, created_at, updated_at) VALUES ('s', 'p', 't', 'x', 'x')".into(),
                    params: vec![],
                },
                Statement {
                    sql: "INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES ('m', 's', 'user', 'oi', 'x')".into(),
                    params: vec![],
                },
                Statement {
                    sql: "INSERT INTO project_notes (id, project_id, content, created_at, updated_at) VALUES ('n', 'p', 'c', 'x', 'x')".into(),
                    params: vec![],
                },
            ],
        )
        .unwrap();

        execute(&conn, "DELETE FROM projects WHERE id = 'p'", &[]).unwrap();

        for table in ["chat_sessions", "chat_messages", "project_notes"] {
            let rows = select(&conn, &format!("SELECT id FROM {table}"), &[]).unwrap();
            assert!(rows.is_empty(), "{table} should be empty");
        }
    }

    #[test]
    fn foreign_keys_reject_orphans() {
        let conn = memory();
        let result = execute(
            &conn,
            "INSERT INTO project_notes (id, project_id, content, created_at, updated_at) VALUES ('n', 'nope', 'c', 'x', 'x')",
            &[],
        );
        assert!(result.is_err());
    }

    #[test]
    fn statements_deserialize_with_optional_params() {
        let statement: Statement = serde_json::from_value(json!({"sql": "SELECT 1"})).unwrap();
        assert!(statement.params.is_empty());
    }
}
