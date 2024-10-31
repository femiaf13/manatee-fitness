use diesel::prelude::*;
use diesel::sql_query;
use diesel::sql_types::Text;
use diesel::sqlite::SqliteConnection;
use tauri::Manager;
use time::*;

use crate::models::*;
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

#[tauri::command]
pub fn find_calories_by_date(app_handle: tauri::AppHandle, date_to_find: Date) -> f32 {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    // This is a now outdated example of a more complicated query actually using diesel
    // instead of raw SQL.
    // use crate::schema::foods::dsl::*;
    // use crate::schema::meal_foods::dsl::*;
    // use crate::schema::meals::dsl::*;
    // This sums every food eaten on the given day
    // let result: Option<f32> = meal_foods
    //     .inner_join(meals::table())
    //     .inner_join(foods::table())
    //     .filter(meal_date.eq(date_to_find))
    //     .select(sum((quantity_grams * calories_per_100g) / 100.0))
    //     .first::<Option<f32>>(connection)
    //     .unwrap_or(Some(0.0));

    // I lose protections with raw sql, but by using ifnull I make sure we get a number back
    // no matter what
    let query = sql_query(
            "SELECT 
	            ifnull(SUM(MF.quantity_grams * F.calories_per_100g / 100), 0) AS calories,
	            ifnull(SUM(MF.quantity_grams * F.fat / 100), 0) AS fat,
	            ifnull(SUM(MF.quantity_grams * F.carbs / 100), 0) AS protein,
	            ifnull(SUM(MF.quantity_grams * F.protein / 100), 0) AS carbs,
	            ifnull(SUM(MF.quantity_grams * F.cholesterol / 100), 0) AS cholesterol,
	            ifnull(SUM(MF.quantity_grams * F.fiber / 100), 0) AS fiber
            FROM meals M 
	            JOIN meal_foods MF ON M.id = MF.meal_id
	            JOIN foods F ON MF.food_id = F.id
            WHERE 
	            M.meal_date = ?;",
    );
    let better_result: SummedFood = query
        .bind::<Text, _>(date_to_find.to_string())
        .get_result(connection)
        .ok()
        .unwrap();

    let pretty_json = serde_json::to_string_pretty(&better_result).ok().unwrap();
    println!("{}", pretty_json);

    better_result.calories
}
