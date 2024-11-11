use diesel::insert_into;
use diesel::prelude::*;
use diesel::sql_query;
use diesel::sql_types::Text;
use diesel::sqlite::SqliteConnection;
use tauri::Manager;
use time::macros::date;
use time::*;

use crate::models::*;
use crate::schema::*;
use crate::AppState;

pub fn establish_connection(database_url: String) -> SqliteConnection {
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[tauri::command]
pub fn create_food(app_handle: tauri::AppHandle, food: FoodDTO) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::foods::dsl::*;

    let query_result = insert_into(foods).values(&food).execute(connection);

    let result: bool = match query_result {
        Ok(_numer_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn find_food_by_id(app_handle: tauri::AppHandle, food_id: &str) -> Food {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    use crate::schema::foods::dsl::*;

    let connection = &mut establish_connection(database_url);

    let food_id_int: i32 = food_id.parse().unwrap_or(1);

    foods
        .filter(id.eq(food_id_int))
        .first::<Food>(connection)
        .expect("Error loading food")
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

    foods
        .filter(description.like(pattern))
        .load::<Food>(connection)
        .expect("Error loading food")
}

#[tauri::command]
pub fn find_foods_by_meal(app_handle: tauri::AppHandle, meal_id: i32) -> Vec<Food> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);

    let meal = meals::table
        .filter(meals::id.eq(meal_id))
        .select(Meal::as_select())
        .first(connection)
        .unwrap_or(Meal {
            id: -1,
            meal_date: date!(1970 - 1 - 1),
            meal_name: String::from(""),
        });

    if meal.id == -1 {
        return vec![];
    }

    MealFood::belonging_to(&meal)
        .inner_join(foods::table)
        .select(Food::as_select())
        .load(connection)
        .unwrap_or_default()
}

#[tauri::command]
pub fn create_meal(app_handle: tauri::AppHandle, meal: MealDTO) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::meals::dsl::*;

    let query_result = insert_into(meals).values(&meal).execute(connection);

    let result: bool = match query_result {
        Ok(_numer_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn find_meals_by_date(app_handle: tauri::AppHandle, date_to_find: Date) -> Vec<Meal> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    use crate::schema::meals::dsl::*;

    let connection = &mut establish_connection(database_url);

    meals
        .filter(meal_date.eq(date_to_find))
        .load::<Meal>(connection)
        .expect("Error loading meals")
}

#[tauri::command]
pub fn find_calories_by_date(app_handle: tauri::AppHandle, date_to_find: Date) -> SummedFood {
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
    let summed_day: SummedFood = query
        .bind::<Text, _>(date_to_find.to_string())
        .get_result(connection)
        .ok()
        .unwrap();

    let pretty_json = serde_json::to_string_pretty(&summed_day).ok().unwrap();
    println!("{}", pretty_json);

    summed_day
}

#[tauri::command]
pub fn find_calories_by_date_and_meal(
    app_handle: tauri::AppHandle,
    date_to_find: Date,
    meal_to_find: &str,
) -> SummedFood {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
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
	            M.meal_date = ?
                AND
                M.meal_name = ?;",
    );
    let summed_meal: SummedFood = query
        .bind::<Text, _>(date_to_find.to_string())
        .bind::<Text, _>(meal_to_find)
        .get_result(connection)
        .ok()
        .unwrap();

    summed_meal
}
