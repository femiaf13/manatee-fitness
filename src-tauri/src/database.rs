use diesel::insert_into;
use diesel::prelude::*;
use diesel::sql_query;
use diesel::sql_types::Integer;
use diesel::sql_types::Text;
use diesel::sqlite::SqliteConnection;
use tauri::Manager;
use time::macros::date;
use time::Date;

use crate::models::*;
use crate::schema::*;
use crate::AppState;

pub fn establish_connection(database_url: String) -> SqliteConnection {
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[tauri::command]
pub fn create_food(app_handle: tauri::AppHandle, food: FoodDTO) -> Result<Food, String> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::foods::dsl::*;

    let query_result = insert_into(foods)
        .values(&food)
        .get_result::<Food>(connection);

    // Error is not serializable so make it a string
    let result = query_result.map_err(|err| err.to_string());
    result
}

#[tauri::command]
pub fn find_food_by_id(app_handle: tauri::AppHandle, food_id: i32) -> Food {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    use crate::schema::foods::dsl::*;

    let connection = &mut establish_connection(database_url);

    // let food_id_int: i32 = food_id.parse().unwrap_or(1);

    foods
        .filter(id.eq(food_id))
        .first::<Food>(connection)
        .expect("Error loading food")
}

#[tauri::command]
pub fn find_foods_by_barcode(app_handle: tauri::AppHandle, food_barcode: &str) -> Vec<Food> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::foods::dsl::*;

    // UPC barcodes are 12 characters and sometimes OFF
    // adds a 0 to the start to make it conform to EAN-13.
    // Wildcard the beginning makes it slower to search but covers both
    // situations.
    let pattern = format!("%{}", food_barcode);

    foods
        .filter(barcode.like(pattern))
        .order(description.asc())
        .load::<Food>(connection)
        .unwrap_or(vec![])
}

#[tauri::command]
pub fn find_foods_by_search(app_handle: tauri::AppHandle, search_term: &str) -> Vec<Food> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    let pattern = format!("%{}%", search_term);
    use crate::schema::foods::dsl::*;

    foods
        .filter(description.like(&pattern))
        .or_filter(brand.like(&pattern))
        .order(description.asc())
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
            meal_time: String::from("00:00"),
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
pub fn update_food_by_dto(app_handle: tauri::AppHandle, food_id: i32, food_dto: FoodDTO) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::foods::dsl::*;

    let query_result = diesel::update(foods)
        .filter(id.eq(food_id))
        .set((
            barcode.eq(food_dto.barcode),
            description.eq(food_dto.description),
            brand.eq(food_dto.brand),
            calories_per_100g.eq(food_dto.calories_per_100g),
            grams_per_serving.eq(food_dto.grams_per_serving),
            serving_text.eq(food_dto.serving_text),
            fat.eq(food_dto.fat),
            carbs.eq(food_dto.carbs),
            protein.eq(food_dto.protein),
            cholesterol.eq(food_dto.cholesterol),
            fiber.eq(food_dto.fiber),
            sodium.eq(food_dto.sodium),
        ))
        .execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn create_meal(app_handle: tauri::AppHandle, meal: MealDTO) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::meals::dsl::*;

    let query_result = insert_into(meals).values(&meal).execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn find_meal_by_id(app_handle: tauri::AppHandle, meal_id: i32) -> Meal {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    use crate::schema::meals::dsl::*;

    let connection = &mut establish_connection(database_url);

    meals
        .filter(id.eq(meal_id))
        .first::<Meal>(connection)
        .expect("Error loading meal")
}

#[tauri::command]
pub fn find_meals_by_date(app_handle: tauri::AppHandle, date_to_find: Date) -> Vec<Meal> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    use crate::schema::meals::dsl::*;

    let connection = &mut establish_connection(database_url);

    meals
        .filter(meal_date.eq(date_to_find))
        .order(meal_time.asc())
        .load::<Meal>(connection)
        .expect("Error loading meals")
}

#[tauri::command]
pub fn update_meal_by_dto(app_handle: tauri::AppHandle, meal_id: i32, meal_dto: MealDTO) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::meals::dsl::*;

    let query_result = diesel::update(meals)
        .filter(id.eq(meal_id))
        .set((
            meal_date.eq(meal_dto.meal_date),
            meal_name.eq(meal_dto.meal_name),
            meal_time.eq(meal_dto.meal_time),
        ))
        .execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn delete_meal(app_handle: tauri::AppHandle, meal_id: i32) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);

    // Delete all meal foods associated with this meal
    let mut query_result =
        diesel::delete(meal_foods::table.filter(meal_foods::meal_id.eq(meal_id)))
            .execute(connection);

    let mut result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    if !result {
        return result;
    }

    query_result = diesel::delete(meals::table.filter(meals::id.eq(meal_id))).execute(connection);

    result = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn create_mealfood(app_handle: tauri::AppHandle, mealfood: MealFood) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::meal_foods::dsl::*;

    let query_result = insert_into(meal_foods)
        .values(&mealfood)
        .execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn find_mealfood_by_meal(app_handle: tauri::AppHandle, meal_id: i32) -> Vec<MealFood> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    // use crate::schema::meal_foods::dsl::*;

    meal_foods::table
        .filter(meal_foods::meal_id.eq(meal_id))
        .load::<MealFood>(connection)
        .unwrap_or(vec![])
}

#[tauri::command]
pub fn update_mealfood(app_handle: tauri::AppHandle, mealfood: MealFood) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::meal_foods::dsl::*;

    let query_result = diesel::update(meal_foods)
        .filter(food_id.eq(mealfood.food_id))
        .filter(meal_id.eq(mealfood.meal_id))
        .set(quantity_grams.eq(mealfood.quantity_grams))
        .execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn delete_mealfood(app_handle: tauri::AppHandle, meal_id: i32, food_id: i32) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    // use crate::schema::meal_foods::dsl::*;

    let query_result = diesel::delete(
        meal_foods::table
            .filter(meal_foods::food_id.eq(food_id))
            .filter(meal_foods::meal_id.eq(meal_id)),
    )
    .execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn create_recipe(app_handle: tauri::AppHandle, recipe_name: &str) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);

    let query_result = insert_into(recipes::table)
        .values(recipes::recipe_name.eq(recipe_name))
        .execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn find_recipes(app_handle: tauri::AppHandle) -> Vec<Recipe> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::recipes::dsl::*;

    recipes
        .order(recipe_name.asc())
        .load::<Recipe>(connection)
        .unwrap_or(vec![])
}

#[tauri::command]
pub fn update_recipe(app_handle: tauri::AppHandle, recipe_id: i32, new_name: &str) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::recipes::dsl::*;

    let query_result = diesel::update(recipes)
        .filter(id.eq(recipe_id))
        .set(recipe_name.eq(new_name))
        .execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn delete_recipe(app_handle: tauri::AppHandle, recipe_id: i32) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);

    // Delete all recipe foods associated with this recipe
    let mut query_result =
        diesel::delete(recipe_foods::table.filter(recipe_foods::recipe_id.eq(recipe_id)))
            .execute(connection);

    let mut result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    if !result {
        return result;
    }

    query_result =
        diesel::delete(recipes::table.filter(recipes::id.eq(recipe_id))).execute(connection);

    result = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn create_recipefood(app_handle: tauri::AppHandle, recipe_food: RecipeFood) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::recipe_foods::dsl::*;

    let query_result = insert_into(recipe_foods)
        .values(&recipe_food)
        .execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn find_recipefood_by_recipe(app_handle: tauri::AppHandle, recipe_id: i32) -> Vec<RecipeFood> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);

    recipe_foods::table
        .filter(recipe_foods::recipe_id.eq(recipe_id))
        .load::<RecipeFood>(connection)
        .unwrap_or(vec![])
}

#[tauri::command]
pub fn update_recipefood(app_handle: tauri::AppHandle, recipe_food: RecipeFood) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    use crate::schema::recipe_foods::dsl::*;

    let query_result = diesel::update(recipe_foods)
        .filter(food_id.eq(recipe_food.food_id))
        .filter(recipe_id.eq(recipe_food.recipe_id))
        .set(quantity_grams.eq(recipe_food.quantity_grams))
        .execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };

    result
}

#[tauri::command]
pub fn delete_recipefood(app_handle: tauri::AppHandle, recipe_id: i32, food_id: i32) -> bool {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);

    let query_result = diesel::delete(
        recipe_foods::table
            .filter(recipe_foods::recipe_id.eq(recipe_id))
            .filter(recipe_foods::food_id.eq(food_id)),
    )
    .execute(connection);

    let result: bool = match query_result {
        Ok(_number_of_rows) => true,
        Err(_e) => false,
    };
    result
}

#[tauri::command]
/// Calculate the summed nutrional info for each food in a meal
pub fn find_summed_mealfood_by_meal(
    app_handle: tauri::AppHandle,
    meal_id: i32,
) -> Vec<SummedMealFood> {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    let mut answer: Vec<SummedMealFood> = vec![];

    let meal_foods_found = meal_foods::table
        .filter(meal_foods::meal_id.eq(meal_id))
        .load::<MealFood>(connection)
        .unwrap_or(vec![]);

    for item in meal_foods_found.iter() {
        let food = find_food_by_id(app_handle.clone(), item.food_id);
        let summed_food = find_calories_by_mealfood(app_handle.clone(), item.food_id, meal_id);
        let mut quantity_servings = 0.0;
        if food.grams_per_serving != 0.0 {
            quantity_servings = item.quantity_grams / food.grams_per_serving
        }
        let summed_meal_food = SummedMealFood {
            quantity_grams: item.quantity_grams,
            quantity_servings,
            food,
            summed_food,
        };
        answer.push(summed_meal_food);
    }

    answer
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
                round(ifnull(SUM(MF.quantity_grams * F.calories_per_100g / 100), 0)) AS calories,
                ifnull(SUM(MF.quantity_grams * F.fat / 100), 0) AS fat,
                ifnull(SUM(MF.quantity_grams * F.carbs / 100), 0) AS protein,
                ifnull(SUM(MF.quantity_grams * F.protein / 100), 0) AS carbs,
                ifnull(SUM(MF.quantity_grams * F.cholesterol / 100), 0) AS cholesterol,
                ifnull(SUM(MF.quantity_grams * F.fiber / 100), 0) AS fiber,
                ifnull(SUM(MF.quantity_grams * F.sodium / 100), 0) AS sodium
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
                round(ifnull(SUM(MF.quantity_grams * F.calories_per_100g / 100), 0)) AS calories,
                ifnull(SUM(MF.quantity_grams * F.fat / 100), 0) AS fat,
                ifnull(SUM(MF.quantity_grams * F.carbs / 100), 0) AS protein,
                ifnull(SUM(MF.quantity_grams * F.protein / 100), 0) AS carbs,
                ifnull(SUM(MF.quantity_grams * F.cholesterol / 100), 0) AS cholesterol,
                ifnull(SUM(MF.quantity_grams * F.fiber / 100), 0) AS fiber,
                ifnull(SUM(MF.quantity_grams * F.sodium / 100), 0) AS sodium
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

fn find_calories_by_mealfood(
    app_handle: tauri::AppHandle,
    food_id: i32,
    meal_id: i32,
) -> SummedFood {
    let database_url = app_handle.state::<AppState>().database_url.clone();
    let connection = &mut establish_connection(database_url);
    let query = sql_query(
        "SELECT 
                round(ifnull(SUM(MF.quantity_grams * F.calories_per_100g / 100), 0)) AS calories,
                ifnull(SUM(MF.quantity_grams * F.fat / 100), 0) AS fat,
                ifnull(SUM(MF.quantity_grams * F.carbs / 100), 0) AS protein,
                ifnull(SUM(MF.quantity_grams * F.protein / 100), 0) AS carbs,
                ifnull(SUM(MF.quantity_grams * F.cholesterol / 100), 0) AS cholesterol,
                ifnull(SUM(MF.quantity_grams * F.fiber / 100), 0) AS fiber,
                ifnull(SUM(MF.quantity_grams * F.sodium / 100), 0) AS sodium
            FROM meals M 
                JOIN meal_foods MF ON M.id = MF.meal_id
                JOIN foods F ON MF.food_id = F.id
            WHERE 
                F.id = ?
                AND
                M.id = ?;",
    );
    let summed_food: SummedFood = query
        .bind::<Integer, _>(food_id)
        .bind::<Integer, _>(meal_id)
        .get_result(connection)
        .ok()
        .unwrap();

    summed_food
}
