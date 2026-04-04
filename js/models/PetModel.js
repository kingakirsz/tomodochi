export class PetModel {
    constructor(savedData = {}) {
        this.energy = savedData.energy !== undefined ? savedData.energy : 100;
        this.points = savedData.points !== undefined ? savedData.points : 0;

        this.happiness = savedData.happiness !== undefined ? savedData.happiness : 0;
        this.wellbeing = savedData.wellbeing !== undefined ? savedData.wellbeing : 0;
        this.friendship = savedData.friendship !== undefined ? savedData.friendship : 0;
        this.expertise = savedData.expertise !== undefined ? savedData.expertise : 0;

        this.shapeStats = savedData.shapeStats !== undefined ? savedData.shapeStats : {
            stickiness: 0,
            translucency: 0,
            doughiness: 0,
            bounciness: 0,
            powderiness: 0
        };

        this.textureStats = savedData.textureStats !== undefined ? savedData.textureStats : {
            sweetness: 0,
            softness: 0,
            subtlety: 0,
            squishiness: 0,
            chewiness: 0
        };
    }
}