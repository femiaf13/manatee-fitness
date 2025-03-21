# Manatee Fitness <img src="./src-tauri/gen/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png" width="50" /> 

Manatee Fitness is a calorie counting and nutrition tracking food diary highly inspired by the wonderful work done over at [Waistline](https://github.com/davidhealey/waistline). Seriously it's a great app and I have a ton of respect for the work they've done. I've had some pain points with the UX of Waistline and am using this project as a fresh start to address those!

Manatee Fitness is free and open source. There will be no ads, no tracking, and every effort taken to make it as usable without an internet connection as possible.

## Screenshots
<p float="left">
    <img src="./screenshots/diary.png" width="200" />
    <img src="./screenshots/search_foods.png" width="200" />
    <img src="./screenshots/add_mealfood.png" width="200" />
    <img src="./screenshots/recipes.png" width="200" />
    <img src="./screenshots/calorie_graph.png" width="200" />
    <img src="./screenshots/weight_graph.png" width="200" />
    <img src="./screenshots/calculate_calorie_goal.png" width="200" />
</p>

## Features

- Create and edit meals, including name, date, and time
- Create, edit, and search food. Both locally and imported from Open Food Facts
- Barcode scanning on mobile platforms!
- Maintain a recipe book of specific foods in specific quantities for easy re-use
- Set goals for calorie consumption and macronutrients
    - Calculate an estimated calorie goal based on the Mifflin-St Jeor Equation
    - Calculate macronutrient goals as a percentage of your total daily calories
- See a visualization of your calorie consumption as a graph
- Record your weight and have your progress graphed for you

## Privacy Policy

This Privacy Policy explains and gives information regarding the collection, use, and disclosure of personal data when you utilize Manatee Fitness and the choices you have associated with that data. By utilizing the software, you accept the terms and conditions of this Policy. This Policy applies to this software and the developer is not responsible for the content or privacy practices on any third-party app not operated by the developer to which this software links or that links to this software.

### Information Collection and Use

Manatee Fitness does not collect any personal data. All information entered into the application is stored on the local device and does not leave that device. 

The only exception is when performing a search for new foods, we contact the Open Food Facts database. We have no control over what Open Food Facts does with the data you send them, but it is limited to barcodes and search terms.

### Service and Data Providers

Manatee Fitness uses two external sources for nutritional information.

1. The [USDA FoodData Central Foundation Foods](https://fdc.nal.usda.gov/Foundation_Foods_Documentation) database comes pre-loaded with Manatee Fitness
2. [Open Food Facts](https://world.openfoodfacts.org/) is used when scanning barcodes or searching for a new food with search terms

### Changes to this Privacy Policy
This privacy policy may be updated from time to time as the functionalities of the software are further developed and improved and may contain disparities that will nullify this current policy.


## Disclaimer
Manatee Fitness is developed in good faith and for general use. The developer will not be held accountable for how you decide to use this software and will not be liable for any losses and/or damages in connection with the use of the software.

Big shout out to [Caius Nocturne](https://nocturne.works) for the adorable icon!

## Development

### Prerequisites

#### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + all of the recommended extensions included in this project's extensions.json file. These include linters and formatters to give the code a consistent style with minimal effort for the developer.

#### Dependencies

Follow [Tauri's guide to install prerequisites](https://v2.tauri.app/start/prerequisites/)

### Upgrading Dependencies

1. Use https://angular.dev/update-guide
    - Upgrade Angular with: `npx ng update @angular/core@<version> @angular/cli@<version> @angular-eslint/schematics@<version> --allow-dirty` where version is something like `19`. *Note the addition of eslint compared to what the guide lists.*


### Run the application

Depending on your target platform follow [Tauri's guide on running an app](https://v2.tauri.app/develop/).

I use `cargo tauri dev` when working on desktop and `cargo tauri android dev` when I want to load Manatee Fitness on an android emulator.