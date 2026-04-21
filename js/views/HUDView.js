export class HUDView {
    constructor() {
        this.energyFill = document.getElementById("hud-energy-fill");
        this.pointsText = document.getElementById("hud-points-text");
    }

    update(energy, points) {
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
    }
}