import { BaseWindow } from "./BaseWindow.js";
import { CATEGORY_ICONS } from "../../utils/categoryConfig.js";

export class ToDoWindow extends BaseWindow {
    constructor(windowElement, onToggleTask, onReorderTasks, onEditTask) {
        super(windowElement);
        this.contentArea = this.element.querySelector('.window-content');
        this.onToggleTask = onToggleTask;
        this.onReorderTasks = onReorderTasks;
        this.onEditTask = onEditTask;

        this.contentArea.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggingElement = this.contentArea.querySelector('.dragging');
            if (!draggingElement) return;

            const afterElement = this.getDragAfterElement(this.contentArea, e.clientY);
            if (afterElement === null) {
                this.contentArea.appendChild(draggingElement);
            } else {
                this.contentArea.insertBefore(draggingElement, afterElement);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return {offset: offset, element: child};
            } else {
                return closest;
            }
        }, {offset: Number.NEGATIVE_INFINITY}).element;
    }

    render(tasks) {
        this.contentArea.innerHTML = "";

        if (tasks.length === 0) {
            this.contentArea.innerHTML = "<p style='text-align: center; color: var(--color-secondary); margin-top: 20px;'>Nothing To Do...</p>";
            return;
        }

        tasks.forEach(task => {
            const taskDiv = document.createElement("div");
            taskDiv.className = "task-item";
            taskDiv.classList.add(task.getMatrixQuadrant().toLowerCase());

            if (task.isCompleted) {
                taskDiv.classList.add("completed");
            }

            taskDiv.dataset.id = task.id;
            taskDiv.draggable = true;

            taskDiv.addEventListener("dragstart", () => {
                taskDiv.classList.add("dragging");
            });

            taskDiv.addEventListener("dragend", () => {
                taskDiv.classList.remove("dragging");

                const currentElements = Array.from(this.contentArea.querySelectorAll('.task-item'));
                const newOrderIds = currentElements.map(el => el.dataset.id);

                if (this.onReorderTasks) {
                    this.onReorderTasks(newOrderIds);
                }
            });

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.isCompleted;

            checkbox.addEventListener("change", () => {
                if (this.onToggleTask) {
                    this.onToggleTask(task.id, checkbox.checked);
                }
            })

            const titleSpan = document.createElement("span");
            titleSpan.textContent = task.title;

            const editBtn = document.createElement("button");
            editBtn.className = "edit-task-btn";
            editBtn.textContent = "✏️";
            editBtn.addEventListener("click", () => {
                if (this.onEditTask) {
                    this.onEditTask(task.id);
                }
            });

            const categoryIcon = document.createElement("span");
            categoryIcon.className = "task-category-icon";
            categoryIcon.textContent = CATEGORY_ICONS[task.category] ?? "";

            taskDiv.appendChild(checkbox);
            taskDiv.appendChild(titleSpan);
            taskDiv.appendChild(categoryIcon);
            taskDiv.appendChild(editBtn);
            this.contentArea.appendChild(taskDiv);
        });
    }
}