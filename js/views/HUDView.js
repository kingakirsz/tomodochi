export class HUDView {
    constructor() {
        this.energyFill = document.getElementById("hud-energy-fill");
        this.pointsText = document.getElementById("hud-points-text");
        this.cravingText = document.getElementById("hud-craving-text");
    }

    update(energy, points, craving) {
        if (this.pointsText) {
            this.pointsText.textContent = points;
        }

        if (this.energyFill) {
            const safeEnergy = Math.max(0, Math.min(100, energy));
            this.energyFill.style.width = `${safeEnergy}%`;

            if (safeEnergy > 50) {
                this.energyFill.style.backgroundColor = "#74c69d";
            } else if (safeEnergy > 20) {
                this.energyFill.style.backgroundColor = "#ffd166";
            } else {
                this.energyFill.style.backgroundColor = "#ef476f";
            }
        }

        if(this.cravingText) {
            this.cravingText.textContent = craving || "None";
        }
    }
}