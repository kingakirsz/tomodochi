import {BaseWindow} from "./BaseWindow.js";
import { CATEGORY_ICONS } from "../../utils/categoryConfig.js";

export class KanbanWindow extends BaseWindow {
    constructor(windowElement, onMoveTask) {
        super(windowElement);
        this.todoCol = this.element.querySelector(".kanban-todo");
        this.inProgressCol = this.element.querySelector(".kanban-in-progress");
        this.doneCol = this.element.querySelector(".kanban-done");

        this.onMoveTask = onMoveTask;
        this.setupDropZones();
    }

    setupDropZones() {
        const zones = [
            {container: this.todoCol, status: "todo"},
            {container: this.inProgressCol, status: "in-progress"},
            {container: this.doneCol, status: "done"},
        ];

        zones.forEach(zone => {
            if (!zone.container) return;

            zone.container.addEventListener("dragover", (e) => {
                e.preventDefault();
                zone.container.style.setProperty("background-color", "var(--color-primary-light)");
            });

            zone.container.addEventListener("dragleave", () => {
                zone.container.style.setProperty("background-color", "transparent");
            });

            zone.container.addEventListener("drop", (e) => {
                e.preventDefault();
                zone.container.style.setProperty("background-color", "transparent");

                const taskId = e.dataTransfer.getData("application/kanban-task");
                if (taskId && this.onMoveTask) {
                    this.onMoveTask(taskId, zone.status);
                }
            });
        });
    }

    render (allTasks) {
        if (!this.todoCol || !this.inProgressCol || !this.doneCol) return;

        [this.todoCol, this.inProgressCol, this.doneCol].forEach(col => {
            col.innerHTML = "";
        });

        allTasks.forEach(task => {
            const taskElement = document.createElement("div");
            taskElement.className = "task-item";
            taskElement.classList.add(task.getMatrixQuadrant().toLowerCase());

            const titleSpan = document.createElement("span");
            titleSpan.textContent = task.title;

            const categoryIcon = document.createElement("span");
            categoryIcon.className = "task-category-icon";
            categoryIcon.textContent = CATEGORY_ICONS[task.category] ?? "";

            taskElement.appendChild(titleSpan);
            taskElement.appendChild(categoryIcon);

            taskElement.dataset.id = task.id;
            taskElement.setAttribute("draggable", true);

            if (task.status === "done") {
                taskElement.classList.add("completed");
            }

            taskElement.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("application/kanban-task", task.id);
                taskElement.classList.add("dragging");
            });

            taskElement.addEventListener("dragend", () => {
                taskElement.classList.remove("dragging");
            });

            switch (task.status) {
                case "todo": this.todoCol.appendChild(taskElement); break;
                case "in-progress": this.inProgressCol.appendChild(taskElement); break;
                case "done": this.doneCol.appendChild(taskElement); break;
            }
        });
    }
}