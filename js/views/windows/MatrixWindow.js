import {BaseWindow} from "./BaseWindow.js";
import { CATEGORY_ICONS } from "../../utils/categoryConfig.js";

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
                zone.container.style.setProperty("box-shadow", "inset 0 0 10px var(--color-shadow-light)");
            });

            zone.container.addEventListener("dragleave", () => {
                zone.container.style.setProperty("box-shadow", "none");
            });

            zone.container.addEventListener("drop", (e) => {
                e.preventDefault();
                zone.container.style.setProperty("box-shadow", "none");

                const taskId = e.dataTransfer.getData("application/matrix-task")

                if (taskId && this.onMoveTask) {
                    this.onMoveTask(taskId, zone.quadrant);
                }
            });
        });
    }

    render(allTasks) {
        if (!this.q1Container || !this.q2Container || !this.q3Container || !this.q4Container) {
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

            const titleSpan = document.createElement("span");
            titleSpan.textContent = task.title;

            const categoryIcon = document.createElement("span");
            categoryIcon.className = "task-category-icon";
            categoryIcon.textContent = CATEGORY_ICONS[task.category] ?? "";

            taskElement.appendChild(titleSpan);
            taskElement.appendChild(categoryIcon);

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