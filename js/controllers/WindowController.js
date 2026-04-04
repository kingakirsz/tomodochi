import {ToDoWindow} from "../views/windows/ToDoWindow.js";
import {MatrixWindow} from "../views/windows/MatrixWindow.js";
import {KanbanWindow} from "../views/windows/KanbanWindow.js";

export class WindowController {
    constructor(desktopElement, taskCallbacks) {
        this.desktop = desktopElement;
        this.taskCallbacks = taskCallbacks;
    }

    buildWindowsForList(listObj) {
        const todoTemplate = document.getElementById("todo-window-template");
        const todoEl = todoTemplate.content.cloneNode(true).firstElementChild;

        todoEl.querySelector(".window-title").textContent = `To-Do - ${listObj.name}`;
        this.desktop.appendChild(todoEl);

        listObj.todoWindow = new ToDoWindow(todoEl,
            (taskId, isCompleted) => {this.taskCallbacks.onToggle(taskId, isCompleted);},
            (newOrderIds) => {this.taskCallbacks.onReorder(listObj.id, newOrderIds);}
        );

        const inputField = todoEl.querySelector(".task-input");
        const addBtn = todoEl.querySelector(".add-task-btn");

        const handleAddTask = () => {
            const title = inputField.value.trim();
            if (title) {
                this.taskCallbacks.onAdd(listObj.id, {title: title, isImportant: false, isUrgent: false});
                inputField.value = "";
            }
        };

        addBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleAddTask();
        });

        inputField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAddTask();
            }
        });

        const matrixTemplate = document.getElementById("matrix-window-template");
        const matrixEl = matrixTemplate.content.cloneNode(true).firstElementChild;

        matrixEl.querySelector(".window-title").textContent = `Matrix - ${listObj.name}`;
        this.desktop.appendChild(matrixEl);

        listObj.matrixWindow = new MatrixWindow(matrixEl, (taskId, newQuadrant) => {
            this.taskCallbacks.onUpdateQuadrant(taskId, newQuadrant);
        });

        const kanbanTemplate = document.getElementById("kanban-window-template");
        const kanbanEl = kanbanTemplate.content.cloneNode(true).firstElementChild;

        kanbanEl.querySelector(".window-title").textContent = `Kanban - ${listObj.name}`;
        this.desktop.appendChild(kanbanEl);

        listObj.kanbanWindow = new KanbanWindow(kanbanEl, (taskId, newStatus) => {
            this.taskCallbacks.onUpdateStatus(taskId, newStatus);
        });
    }
}