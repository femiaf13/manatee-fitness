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
