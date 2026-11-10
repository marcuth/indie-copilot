mod db;
mod files;

use std::sync::Mutex;

use serde_json::{Map, Value};
use tauri::{Manager, State};

use db::{Database, Statement};

#[tauri::command]
fn db_select(
    state: State<'_, Database>,
    sql: String,
    params: Vec<Value>,
) -> Result<Vec<Map<String, Value>>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    db::select(&conn, &sql, &params)
}

#[tauri::command]
fn db_execute(
    state: State<'_, Database>,
    sql: String,
    params: Vec<Value>,
) -> Result<usize, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    db::execute(&conn, &sql, &params)
}

#[tauri::command]
fn db_batch(state: State<'_, Database>, statements: Vec<Statement>) -> Result<(), String> {
    let mut conn = state.0.lock().map_err(|e| e.to_string())?;
    db::batch(&mut conn, &statements)
}

#[tauri::command]
fn save_text_file(path: String, contents: String) -> Result<(), String> {
    files::write_text(std::path::Path::new(&path), &contents)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;
            let conn = db::open(&dir.join("indie-copilot.db"))?;
            app.manage(Database(Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            db_select,
            db_execute,
            db_batch,
            save_text_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
