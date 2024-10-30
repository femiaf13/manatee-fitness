use tauri::Manager;

use diesel::prelude::*;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use models::Food;
use std::env;

pub mod database;
pub mod models;
pub mod schema;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

struct AppState {
    database_url: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(app_handle: tauri::AppHandle, food_id: &str) -> Food {
    let database_url = app_handle.state::<AppState>().database_url.clone();

    /**
     *  let pattern = format!("%{}%", target);
     *
     *    let connection = &mut establish_connection();
     *    let num_deleted = diesel::delete(posts.filter(title.like(pattern)))
     *    .execute(connection)
     *    .expect("Error deleting posts");
     */
    // println!("{}", database_url);
    use self::schema::foods::dsl::*;

    let connection = &mut database::establish_connection(database_url);

    let food_id_int: i32 = food_id.parse().unwrap_or(1);
    let result = foods
        .filter(id.eq(food_id_int))
        // Haven't tried without the select but I think it will automatically do *
        // .select(Food::as_select())
        .load::<Food>(connection)
        .expect("Error loading food");

    result[0].clone()
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

            let connection = &mut database::establish_connection(database_url.clone());
            let _ = connection.run_pending_migrations(MIGRATIONS);

            app.manage(AppState {
                database_url: database_url,
            });

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            database::find_food_by_id,
            database::find_food_by_description
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
