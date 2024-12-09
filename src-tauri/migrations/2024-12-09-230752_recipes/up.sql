CREATE TABLE recipes (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    recipe_name TEXT NOT NULL
);

CREATE TABLE recipe_foods (
    recipe_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    quantity_grams REAL NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (food_id) REFERENCES foods(id),
    PRIMARY KEY (recipe_id, food_id)
);
