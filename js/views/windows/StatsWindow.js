import {BaseWindow} from "./BaseWindow.js";

export class StatsWindow extends BaseWindow {
    constructor (element) {
        super(element);

        this.shapeCtx = this.element.querySelector(".shape-chart").getContext("2d");
        this.textureCtx = this.element.querySelector(".texture-chart").getContext("2d");
        this.coreCtx = this.element.querySelector(".core-chart").getContext("2d");

        this.shapeChart = null;
        this.textureChart = null;
        this.coreChart = null;
    }

    render(pet) {
        Chart.defaults.font.family = "Silkscreen, sans-serif";

        const shapeData = [
            pet.shapeStats.stickiness,
            pet.shapeStats.translucency,
            pet.shapeStats.doughiness,
            pet.shapeStats.bounciness,
            pet.shapeStats.powderiness,
        ];

        const textureData = [
            pet.textureStats.sweetness,
            pet.textureStats.softness,
            pet.textureStats.subtlety,
            pet.textureStats.squishiness,
            pet.textureStats.chewiness,
        ];

        const coreData = [pet.happiness, pet.wellness, pet.friendship, pet.expertise];

        if (this.shapeChart) {
            this.shapeChart.data.datasets[0].data = shapeData;
            this.shapeChart.update();
        } else {
            this.shapeChart = new Chart(this.shapeCtx, {
                type: "radar",
                data: {
                    labels: ["Cling", "Glow", "Dough", "Bounce", "Powder"],
                    datasets: [{
                        label: "Shape",
                        data: shapeData,
                        backgroundColor: "rgba(54, 162, 235, 0.2)",
                        borderColor: "rgba(54, 162, 235)",
                        pointBackgroundColor: "rgba(54, 162, 235)",
                    }]
                },
                options: {
                    plugins: { legend: { display: false } },
                    scales: { r: { beginAtZero: true, ticks: {display: false}, grid: { display: false }, angleLines: { display: false }, pointLabels: { font: { size: 10 } } } },
                    maintainAspectRatio: false,
                }
            });
        }

        if (this.textureChart) {
            this.textureChart.data.datasets[0].data = textureData;
            this.textureChart.update();
        } else {
            this.textureChart = new Chart(this.textureCtx, {
                type: "radar",
                data: {
                    labels: ["Sweet", "Soft", "Subtle", "Squishy", "Chewy"],
                    datasets: [{
                        label: "Texture",
                        data: textureData,
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                        borderColor: "rgba(255, 99, 132)",
                        pointBackgroundColor: "rgba(255, 99, 132)",
                    }]
                },
                options: {
                    plugins: { legend: { display: false } },
                    scales: { r: { beginAtZero: true, ticks: {display: false}, grid: { display: false }, angleLines: { display: false }, pointLabels: { font: { size: 10 } } } },
                    maintainAspectRatio: false,
                }
            });
        }

        if (this.coreChart) {
            this.coreChart.data.datasets[0].data = coreData;
            this.coreChart.update();
        } else {
            this.coreChart = new Chart(this.coreCtx, {
                type: "bar",
                data: {
                    labels: ["Happiness", "Wellness", "Friendship", "Expertise"],
                    datasets: [{
                        label: "Core Stats",
                        data: coreData,
                        backgroundColor: ["#FFD700", "#4CAF50", "#FF69B4", "#9C27B0"],
                    }]
                },
                options: {
                    indexAxis: "y",
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true, ticks: {display: false }, grid: { display: false }, border: {display: false } },
                    y: { border: {display: false}, grid: { display: false } } }
                }
            })
        }
    }
}