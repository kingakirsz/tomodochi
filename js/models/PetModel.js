export class PetModel {
    constructor(savedData = {}) {
        this.lastLogin = savedData.lastLogin;
        this.dailyCraving = savedData.dailyCraving !== undefined ? savedData.dailyCraving : "None";

        this.energy = savedData.energy ?? 100;
        this.points = savedData.points ?? 0;

        this.happiness = savedData.happiness ?? 0;
        this.wellness = savedData.wellness ?? 0;
        this.friendship = savedData.friendship ?? 0;
        this.expertise = savedData.expertise ?? 0;
        this.diligence = savedData.diligence ?? 0;

        this.shapeStats = savedData.shapeStats ?? {
            stickiness: 0,
            translucency: 0,
            doughiness: 0,
            bounciness: 0,
            powderiness: 0
        };

        this.textureStats = savedData.textureStats ?? {
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
        this.currentEvolution = savedData.currentEvolution ?? { type: "unformed_mochi", variant: "egg" };
    }

    processTask(task) {
        if (!task.isCompleted) return;

        const stats = this.categoryMap[task.category];

        if (task.category === "Wellness") {
            this.addEnergy(task.difficulty * 2);
        } else {
            this.energy = Math.max(0, Math.min(100, this.energy - task.difficulty));
        }

        const baseReward = task.category === "Chores" ? 20 : 10;
        const multiplier = task.category === this.dailyCraving ? 2 : 1;
        this.points += (baseReward * task.difficulty) * multiplier;

        if (stats) {
            this.shapeStats[stats.base] = Math.min(100, this.shapeStats[stats.base] + task.difficulty);
            this.textureStats[stats.texture] = Math.min(100, this.textureStats[stats.texture] + task.difficulty);
        }

        const coreStatMap = {
            "Social": "friendship",
            "Hobby": "happiness",
            "Wellness": "wellness",
            "Study": "expertise",
            "Chores": "diligence"
        };

        const coreStat = coreStatMap[task.category];
        if (coreStat) {
            this[coreStat] += task.difficulty;
        }
    }

    checkEvolution() {
        const newEvolution = this.getEvolution();
        const changed = newEvolution.type !== this.currentEvolution.type || newEvolution.variant !== this.currentEvolution.variant;

        if (changed) {
            this.currentEvolution = newEvolution;
            return newEvolution;
        }

        return null;
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.lastLogin !== today) {
            this.decayStats();
            this.energy = 100;
            this.lastLogin = today;

            const categories = ["Chores", "Study", "Hobby", "Social", "Wellness"];
            const randomIndex = Math.floor(Math.random() * categories.length);
            this.dailyCraving = categories[randomIndex];
        }
    }

    decayStats() {
        const DECAY_AMOUNT = 2;
        Object.keys(this.shapeStats).forEach(s => {
            this.shapeStats[s] = Math.max(0, this.shapeStats[s] - DECAY_AMOUNT);
        });
        Object.keys(this.textureStats).forEach(t => {
            this.textureStats[t] = Math.max(0, this.textureStats[t] - DECAY_AMOUNT);
        });
    }

    addEnergy(amount) {
        this.energy = Math.min(100, this.energy + amount);
    }

    getEvolution() {
        const shapeEntries = Object.entries(this.shapeStats);
        const [dominantBase, dominantValue] = shapeEntries.reduce((a, b) => a[1] > b[1] ? a : b);

        if (dominantValue < 25) return {type: "unformed_mochi", variant: "egg"};

        const typeMap = {
            stickiness: "dango",
            translucency: "mizushingen",
            doughiness: "hishimochi",
            bounciness: "sakuramochi",
            powderiness: "daifuku",
        };

        const nativeTextureMap = {
            stickiness: "sweetness",
            translucency: "softness",
            doughiness: "subtlety",
            bounciness: "squishiness",
            powderiness: "chewiness",
        }

        const nativeTexture = nativeTextureMap[dominantBase];
        const nativeValue = this.textureStats[nativeTexture];

        const [secondaryStat, secondaryValue] = Object.entries(this.textureStats)
            .filter(([key]) => key !== nativeTexture)
            .sort((a, b) => b[1] - a[1])[0];

        const hasSecondary = secondaryValue >= 10 && secondaryValue >= nativeValue * 0.4;

        return {
            type: typeMap[dominantBase],
            variant: hasSecondary ? secondaryStat : "base"
        };
    }
}