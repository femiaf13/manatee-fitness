// @generated automatically by Diesel CLI.

diesel::table! {
    foods (id) {
        id -> Integer,
        description -> Text,
        calories_per_100g -> Float,
        grams_per_serving -> Float,
        serving_text -> Text,
        calories_per_serving -> Float,
        fat -> Float,
        carbs -> Float,
        protein -> Float,
        cholesterol -> Float,
        fiber -> Float,
    }
}

diesel::table! {
    meal_foods (meal_id, food_id) {
        meal_id -> Integer,
        food_id -> Integer,
        quantity_grams -> Float,
    }
}

diesel::table! {
    meals (id) {
        id -> Integer,
        meal_date -> Date,
        meal_name -> Text,
    }
}

diesel::joinable!(meal_foods -> foods (food_id));
diesel::joinable!(meal_foods -> meals (meal_id));

diesel::allow_tables_to_appear_in_same_query!(
    foods,
    meal_foods,
    meals,
);
