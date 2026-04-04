import {BaseWindow} from "./BaseWindow.js";

export class MatrixWindow extends BaseWindow {
    constructor(windowElement, onMoveTask) {
        super(windowElement);
        this.q1Container = this.element.querySelector(".q1-container");
        this.q2Container = this.element.querySelector(".q2-container");
        this.q3Container = this.element.querySelector(".q3-container");
        this.q4Container = this.element.querySelector(".q4-container");

        this.onMoveTask = onMoveTask;
        this.setupDropZones();
    }

    setupDropZones() {
        const zones = [
            {container: this.q1Container, quadrant: "Q1"},
            {container: this.q2Container, quadrant: "Q2"},
            {container: this.q3Container, quadrant: "Q3"},
            {container: this.q4Container, quadrant: "Q4"}
        ];

        zones.forEach(zone => {
            if (!zone.container) return;

            zone.container.addEventListener("dragover", (e) => {
                e.preventDefault();
                zone.container.style.boxShadow = "inset 0 0 10px rgba(177, 133, 151, 0.3)";
            });

            zone.container.addEventListener("dragleave", () => {
                zone.container.style.boxShadow = "none";
            });

            zone.container.addEventListener("drop", (e) => {
                e.preventDefault();
                zone.container.style.boxShadow = "none";

                const taskId = e.dataTransfer.getData("application/matrix-task")

                if (taskId && this.onMoveTask) {
                    this.onMoveTask(taskId, zone.quadrant);
                }
            });
        });
    }

    render(allTasks) {
        if (!this.q1Container || !this.q2Container || !this.q3Container || !this.q4Container) {
            console.warn("MatrixWindow: Could not find a matrix container!");
            return;
        }

        const allContainers = [this.q1Container, this.q2Container, this.q3Container, this.q4Container];

        allContainers.forEach(container => {
            const tasksToRemove = container.querySelectorAll('.task-item');
            tasksToRemove.forEach(task => task.remove());
        })

        allTasks.forEach(task => {
            if (task.isCompleted) return;

            const taskElement = document.createElement("div");
            taskElement.className = "task-item";

            taskElement.innerHTML = `<span>${task.title}</span>`;
            taskElement.dataset.id = task.id;
            taskElement.setAttribute("draggable", true);

            taskElement.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("application/matrix-task", task.id);
                taskElement.classList.add("dragging");
            });

            taskElement.addEventListener("dragend", () => {
               taskElement.classList.remove("dragging");
            });

            const quadrant = task.getMatrixQuadrant();
            switch (quadrant) {
                case "Q1": this.q1Container.appendChild(taskElement); break;
                case "Q2": this.q2Container.appendChild(taskElement); break;
                case "Q3": this.q3Container.appendChild(taskElement); break;
                case "Q4": this.q4Container.appendChild(taskElement); break;
            }
        });
    }
}