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
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(mobile)]
            let _ = app.handle().plugin(tauri_plugin_barcode_scanner::init());

            let path = app
                .path()
                .app_data_dir()
                .expect("The app data directory should exist.");

            let binding = path.join("food.db");
            let database_url = binding.to_str().unwrap().to_string();

            let connection = &mut establish_connection(database_url.clone());
            let _ = connection.run_pending_migrations(MIGRATIONS);

            app.manage(AppState { database_url });

            // use time::macros::date;
            // find_calories_by_date(app.app_handle().clone(), date!(2024 - 10 - 30));
            // find_calories_by_date_and_meal(app.app_handle().clone(), date!(2024 - 10 - 30), "dinner");
            // let foods = find_foods_by_meal(app.app_handle().clone(), 3);
            // let weigh_ins = find_weigh_ins_between_dates(
            //     app.app_handle().clone(),
            //     date!(2024 - 12 - 01),
            //     date!(2024 - 12 - 02),
            // );

            // let pretty_json = serde_json::to_string_pretty(&weigh_ins).ok().unwrap();
            // println!("{}", pretty_json);

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            create_food,
            find_food_by_id,
            find_foods_by_barcode,
            find_foods_by_search,
            find_foods_by_meal,
            update_food_by_dto,
            create_meal,
            find_meal_by_id,
            find_meals_by_date,
            update_meal_by_dto,
            delete_meal,
            create_mealfood,
            create_mealfoods_from_recipe,
            find_mealfood_by_meal,
            update_mealfood,
            delete_mealfood,
            create_recipe,
            find_recipes,
            find_recipe_by_id,
            update_recipe,
            delete_recipe,
            create_recipefood,
            find_recipefood_by_recipe,
            update_recipefood,
            delete_recipefood,
            find_summed_mealfood_by_meal,
            find_summed_mealfood_by_recipe,
            find_calories_by_date,
            find_calories_by_date_and_meal,
            find_calories_between_dates,
            create_weigh_in,
            find_weigh_ins_between_dates,
            update_weigh_in_by_dto,
            delete_weigh_in,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
