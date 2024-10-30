use diesel::prelude::*;
use serde::Serialize;

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
