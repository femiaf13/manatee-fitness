export class Recipe {
    id: number;
    recipeName: string;

    constructor(recipeName: string = '') {
        this.id = 0;
        this.recipeName = recipeName;
    }
}
