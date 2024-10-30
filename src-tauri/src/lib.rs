pub mod database;
pub mod models;
pub mod schema;

use database::*;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use tauri::Manager;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

struct AppState {
    database_url: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let path = app
                .path()
                .app_data_dir()
                .expect("The app data directory should exist.");

            let binding = path.join("food.db");
            let database_url = binding.to_str().unwrap().to_string();

            let connection = &mut establish_connection(database_url.clone());
            let _ = connection.run_pending_migrations(MIGRATIONS);

            app.manage(AppState {
                database_url: database_url,
            });

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            find_food_by_id,
            find_food_by_description
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
