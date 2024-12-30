// @generated automatically by Diesel CLI.

diesel::table! {
    foods (id) {
        id -> Integer,
        barcode -> Text,
        description -> Text,
        brand -> Text,
        calories_per_100g -> Float,
        grams_per_serving -> Float,
        serving_text -> Text,
        calories_per_serving -> Float,
        fat -> Float,
        carbs -> Float,
        protein -> Float,
        cholesterol -> Float,
        fiber -> Float,
        sodium -> Float,
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
        meal_time -> Text,
        meal_name -> Text,
    }
}

diesel::table! {
    recipe_foods (recipe_id, food_id) {
        recipe_id -> Integer,
        food_id -> Integer,
        quantity_grams -> Float,
    }
}

diesel::table! {
    recipes (id) {
        id -> Integer,
        recipe_name -> Text,
    }
}

diesel::table! {
    weigh_ins (id) {
        id -> Integer,
        weigh_in_date -> Date,
        weight_kg -> Float,
        weight_lb -> Float,
    }
}

diesel::joinable!(meal_foods -> foods (food_id));
diesel::joinable!(meal_foods -> meals (meal_id));
diesel::joinable!(recipe_foods -> foods (food_id));
diesel::joinable!(recipe_foods -> recipes (recipe_id));

diesel::allow_tables_to_appear_in_same_query!(
    foods,
    meal_foods,
    meals,
    recipe_foods,
    recipes,
    weigh_ins,
);
