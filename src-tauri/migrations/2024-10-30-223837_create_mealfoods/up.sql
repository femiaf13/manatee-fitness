CREATE TABLE meal_foods (
    meal_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    quantity_grams REAL NOT NULL,
    FOREIGN KEY (meal_id) REFERENCES meals(id),
    FOREIGN KEY (food_id) REFERENCES foods(id),
    PRIMARY KEY (meal_id, food_id)
);