export class PetModel {
    constructor(savedData = {}) {
        this.energy = savedData.energy !== undefined ? savedData.energy : 100;
        this.points = savedData.points !== undefined ? savedData.points : 0;

        this.happiness = savedData.happiness !== undefined ? savedData.happiness : 0;
        this.wellness = savedData.wellness !== undefined ? savedData.wellness : 0;
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

        this.categoryMap = {
            "Social": {base: "stickiness", texture: "sweetness"},
            "Wellness": {base: "translucency", texture: "softness"},
            "Study": {base: "doughiness", texture: "subtlety"},
            "Hobby": {base: "bounciness", texture: "squishiness"},
            "Chores": {base: "powderiness", texture: "chewiness"},
        };
    }

    processTask(task) {
        if (!task.isCompleted || task.category === "None") return;

        const stats = this.categoryMap[task.category];
        if (!stats) return;

        const energyCost = task.category === "Wellness" ? 0 : task.difficulty;
        this.energy = Math.max(0, Math.min(100, this.energy - energyCost));

        const baseReward = task.category === "Chores" ? 20 : 10;
        this.points += baseReward * task.difficulty;

        this.shapeStats[stats.base] += task.difficulty;
        this.textureStats[stats.texture] += task.difficulty;

        console.log(`Pet updated! Energy: ${this.energy}, Points: ${this.points}`);
    }
}