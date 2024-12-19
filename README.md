# Manatee Fitness

Manatee Fitness is a calorie counting and nutrition tracking food diary highly inspired by the wonderful work done over at [Waistline](https://github.com/davidhealey/waistline). Seriously it's a great app and I have so much respect for the work they've done. The biggest difference is that this project uses Tauri instead of Cordova.

Manatee Fitness is free and open source. There will be no ads, no tracking, and every effort taken to make it as usable without an internet connection as possible.

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


## Prerequisites

### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + all of the recommended extensions included in this project's extensions.json file. These include linters and formatters to give the code a consistent style with minimal effort for the developer.

### Dependencies

Follow [Tauri's guide to install prerequisites](https://v2.tauri.app/start/prerequisites/)

#### Upgrading Dependencies

1. Use https://angular.dev/update-guide
    - Upgrade Angular with: `npx ng update @angular/core@<version> @angular/cli@<version> @angular-eslint/schematics@<version> --allow-dirty` where version is something like `19`. *Note the addition of eslint compared to what the guide lists.*


## Run the application

Depending on your target platform follow [Tauri's guide on running an app](https://v2.tauri.app/develop/).

I use `cargo tauri dev` when working on desktop and `cargo tauri android dev` when I want to load Manatee Fitness on an android emulator.