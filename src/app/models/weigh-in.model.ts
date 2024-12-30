export class WeighInDTO {
    weighInDate: string;
    weightKg: number;

    constructor() {
        this.weighInDate = '';
        this.weightKg = 0;
    }
}

export class WeighIn extends WeighInDTO {
    id: number;
    weightLb: number;

    constructor() {
        super();
        this.id = 0;
        this.weightLb = 0;
    }
}
