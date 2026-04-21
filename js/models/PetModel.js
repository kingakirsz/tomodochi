export class PetModel {
    constructor(savedData = {}) {
        this.lastLogin = savedData.lastLogin;

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

        this.checkDailyReset();
    }

    processTask(task) {
        if (!task.isCompleted) return;

        const stats = this.categoryMap[task.category];

        if (task.category !== "Wellness") {
            this.energy = Math.max(0, Math.min(100, this.energy - task.difficulty));
        }

        const baseReward = task.category === "Chores" ? 20 : 10;
        this.points += baseReward * task.difficulty;

        if (stats) {
            this.shapeStats[stats.base] += task.difficulty;
            this.textureStats[stats.texture] += task.difficulty;
        }

        console.log(`Pet updated! Energy: ${this.energy}, Points: ${this.points}`);
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.lastLogin !== today) {
            this.energy = 100;
            this.lastLogin = today;
            console.log("New day! Energy restored to 100.");
        }
    }

    addEnergy(amount) {
        this.energy = Math.min(100, this.energy + amount);
        console.log(`Energy increased by ${amount}. Current energy: ${this.energy}`);
    }
}