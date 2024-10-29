use tauri::Manager;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dotenvy::dotenv;
use models::Food;
use std::env;

pub mod models;
pub mod schema;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

fn establish_connection(database_url: &str) -> SqliteConnection {
    dotenv().ok();
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(app_handle: tauri::AppHandle, food_id: &str) -> String {
    let app_dir = app_handle.path().app_data_dir().expect("The app data directory should exist.");
    let binding = app_dir.join("food.db");
    let database_url = binding.to_str().unwrap();
    // println!("{}", database_url);
    use self::schema::foods::dsl::*;

    let connection = &mut establish_connection(database_url);

    let food_id_int: i32 = food_id.parse().unwrap_or(1);
    let result = foods
        .filter(id.eq(food_id_int))
        .select(Food::as_select())
        .load::<Food>(connection)
        .expect("Error loading food");

    format!("Hello, {}! You've been greeted from Rust!", result[0].description)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let path = app.path().app_data_dir().expect("The app data directory should exist.");

            let binding = path.join("food.db");
            let database_url = binding.to_str().unwrap();
            
            let connection = &mut establish_connection(database_url);
            let _ = connection.run_pending_migrations(MIGRATIONS);

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
