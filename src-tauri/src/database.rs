use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use tauri::Manager;
use time::*;

use crate::models::{Food, Meal};
use crate::AppState;

pub fn establish_connection(database_url: String) -> SqliteConnection {
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[tauri::command]
pub fn find_food_by_id(app_handle: tauri::AppHandle, food_id: &str) -> Food {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    use crate::schema::foods::dsl::*;

    let connection = &mut establish_connection(database_url);

    let food_id_int: i32 = food_id.parse().unwrap_or(1);
    let result = foods
        .filter(id.eq(food_id_int))
        .first::<Food>(connection)
        .expect("Error loading food");

    result
}

#[tauri::command]
pub fn find_foods_by_description(
    app_handle: tauri::AppHandle,
    food_description: &str,
) -> Vec<Food> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let pattern = format!("%{}%", food_description);
    use crate::schema::foods::dsl::*;

    let connection = &mut establish_connection(database_url);
    let result = foods
        .filter(description.like(pattern))
        .load::<Food>(connection)
        .expect("Error loading food");

    result
}

#[tauri::command]
pub fn find_meals_by_date(app_handle: tauri::AppHandle, date_to_find: Date) -> Vec<Meal> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    use crate::schema::meals::dsl::*;

    let connection = &mut establish_connection(database_url);
    let result = meals
        .filter(meal_date.eq(date_to_find))
        .load::<Meal>(connection)
        .expect("Error loading meals");

    result
}
