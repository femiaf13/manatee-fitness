export class WeighInDTO {
    weigh_in_date: string;
    weight_kg: number;

    constructor() {
        this.weigh_in_date = '';
        this.weight_kg = 0;
    }
}

export class WeighIn extends WeighInDTO {
    id: number;
    weight_lb: number;

    constructor() {
        super();
        this.id = 0;
        this.weight_lb = 0;
    }
}
