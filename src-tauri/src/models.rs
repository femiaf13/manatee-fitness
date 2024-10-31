use diesel::prelude::*;
use serde::Serialize;

use diesel::sql_types::*;

#[derive(Queryable, Selectable, Clone, Serialize)]
#[diesel(table_name = crate::schema::foods)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Food {
    pub id: i32,
    pub description: String,
    pub calories_per_100g: f32,
    pub grams_per_serving: f32,
    pub serving_text: String,
    pub calories_per_serving: f32,
    pub fat: f32,
    pub carbs: f32,
    pub protein: f32,
    pub cholesterol: f32,
    pub fiber: f32,
}

#[derive(Queryable, Selectable, Clone, Serialize)]
#[diesel(table_name = crate::schema::meals)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Meal {
    pub id: i32,
    pub meal_date: time::Date,
    pub meal_name: String,
}

#[derive(Queryable, Selectable, Identifiable, Associations, Clone, Serialize)]
#[diesel(belongs_to(Food))]
#[diesel(belongs_to(Meal))]
#[diesel(table_name = crate::schema::meal_foods)]
#[diesel(primary_key(meal_id, food_id))]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct MealFood {
    pub meal_id: i32,
    pub food_id: i32,
    pub quantity_grams: f32,
}

#[derive(Default, QueryableByName, Clone, serde::Serialize)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct SummedFood {
    #[diesel(sql_type = Float)]
    pub calories: f32,
    #[diesel(sql_type = Float)]
    pub fat: f32,
    #[diesel(sql_type = Float)]
    pub carbs: f32,
    #[diesel(sql_type = Float)]
    pub protein: f32,
    #[diesel(sql_type = Float)]
    pub cholesterol: f32,
    #[diesel(sql_type = Float)]
    pub fiber: f32,
}
