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
    meals (id) {
        id -> Integer,
        meal_date -> Timestamp,
        meal_name -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    foods,
    meals,
);
