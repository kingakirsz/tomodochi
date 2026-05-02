import {TaskModel}  from "../models/TaskModel.js";
import {StorageService} from "../services/StorageService.js";
import {WindowController} from "./WindowController.js";
import {MenuView} from "../views/MenuView.js";
import {TaskDetailsModal} from "../views/windows/TaskDetailsModal.js";
import {PetModel} from "../models/PetModel.js";
import {HUDView} from "../views/HUDView.js";
import {StatsWindow} from "../views/windows/StatsWindow.js";
import { SpeechBubbleView } from "../views/SpeechBubbleView.js";
import { CATEGORY_ICONS } from "../utils/categoryConfig.js";

export class MainController {
    constructor() {
        this.lists = [];
        this.tasks = [];
        this.pet = new PetModel(StorageService.loadPet());
        this.speechBubble = new SpeechBubbleView();
        this.savePetData();

        this.desktop = document.getElementById("desktop");
        this.menuContainer = document.getElementById("lists-menu-container");

        this.hudView = new HUDView();

        this.menuView = new MenuView(this.menuContainer, {
            onRename: this.renameList.bind(this),
            onDelete: this.deleteList.bind(this)
        });

        this.windowController = new WindowController(this.desktop, {
            onToggle: this.toggleTaskCompletion.bind(this),
            onReorder: this.reorderTasks.bind(this),
            onAdd: this.addNewTask.bind(this),
            onUpdateQuadrant: this.updateTaskQuadrant.bind(this),
            onUpdateStatus: this.updateTaskStatus.bind(this),
            onEdit: this.openTaskModal.bind(this)
        });

        const statsTemplate = document.getElementById("stats-window-template");
        const statsEl = statsTemplate.content.cloneNode(true).firstElementChild;
        this.desktop.appendChild(statsEl);
        this.statsWindow = new StatsWindow(statsEl);

        const btnStats = document.getElementById("btn-stats");
        if (btnStats) {
            btnStats.addEventListener("click", () => {
                this.statsWindow.toggleVisibility();
                this.statsWindow.render(this.pet);
            });
        }

        this.loadData();
    }

    createNewList(name) {
        const listId = crypto.randomUUID();
        const newList = {id: listId, name: name, todoWindow: null, matrixWindow: null, kanbanWindow: null};

        this.windowController.buildWindowsForList(newList);
        this.menuView.buildMenuButton(newList);

        this.lists.push(newList);
        this.saveData();
        return newList;
    }

    renameList(id, newName) {
        const list = this.lists.find(l => l.id === id);
        if (list) {
            list.name = newName;

            const windowsToUpdate = [
                {instance: list.todoWindow, prefix: "To-Do"},
                {instance: list.matrixWindow, prefix: "Matrix"},
                {instance: list.kanbanWindow, prefix: "Kanban"},
            ];

            windowsToUpdate.forEach(w => {
                if (w.instance) {
                    w.instance.setTitle(`${w.prefix} - ${newName}`);
                }
            })

            const menuItem = this.menuContainer.querySelector(`[data-list-id="${id}"] span`);
            if (menuItem) {
                menuItem.textContent = newName;
            }

            this.saveData();
        }
    }

    deleteList(id) {
        const listIndex = this.lists.findIndex(l => l.id === id);
        if (listIndex > -1) {
            const list = this.lists[listIndex];

            if (list.todoWindow) list.todoWindow.element.remove();
            if (list.matrixWindow) list.matrixWindow.element.remove();
            if (list.kanbanWindow) list.kanbanWindow.element.remove();

            const menuItem = this.menuContainer.querySelector(`[data-list-id="${id}"]`);
            if (menuItem) menuItem.remove();

            this.lists.splice(listIndex, 1);
            this.tasks = this.tasks.filter(t => t.listId !== id);

            this.saveAndNotify()
        }
    }

    addNewTask(listId, taskData) {
        const newTask = new TaskModel({...taskData, listId: listId, order: this.tasks.length});
        this.tasks.push(newTask);
        this.saveAndNotify();
    }

    saveData() {
        StorageService.saveLists(this.lists);
        StorageService.saveTasks(this.tasks);
    }

    loadData() {
        const savedLists = StorageService.loadLists();
        const savedTasks = StorageService.loadTasks();

        savedLists.forEach(listData => {
            const newList = {id: listData.id, name: listData.name, todoWindow: null, matrixWindow: null, kanbanWindow: null};
            this.windowController.buildWindowsForList(newList);
            this.menuView.buildMenuButton(newList);
            this.lists.push(newList);
        });

        this.tasks = savedTasks.map(taskData => new TaskModel(taskData));
        this.notifyViews();

        const today = new Date().toDateString();
        if (this.pet.lastLogin === today) {
            this.speechBubble.show(
                `Hello! Today I'm craving ${this.pet.dailyCraving}! ${CATEGORY_ICONS[this.pet.dailyCraving]}`,
                5000
            );
        }
    }

    notifyViews() {
       this.lists.forEach(list => {
           const listTasks = this.tasks.filter(t => t.listId === list.id && t.parentId === null).sort((a, b) => {
              if (a.isCompleted !== b.isCompleted) {
                  return a.isCompleted ? 1 : -1;
              }
              return a.order - b.order;
          });
          if (list.todoWindow) list.todoWindow.render(listTasks);
          if (list.matrixWindow) list.matrixWindow.render(listTasks);
          if (list.kanbanWindow) list.kanbanWindow.render(listTasks);
       });
       if (this.hudView && this.pet) {
           this.hudView.update(this.pet.energy, this.pet.points, this.pet.dailyCraving);
       }
       if (this.statsWindow && this.statsWindow.element.style.display !== "none") {
           this.statsWindow.render(this.pet);
       }
    }

    toggleTaskCompletion(taskId, isCompleted) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.isCompleted = isCompleted;
            if (isCompleted) {
                this.pet.processTask(task);
                const evolution = this.pet.checkEvolution();
                if (evolution) {
                    this.speechBubble.show(`I evolved into ${evolution.type}!`, 5000);
                } else {
                    this.speechBubble.showRandom();
                }
                this.savePetData();
            }
            this.saveAndNotify();
        }
    }

    reorderTasks(listId, newOrderIds) {
        newOrderIds.forEach((id, index) => {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                task.order = index;
            }
        });
        this.saveAndNotify();
    }

    updateTaskQuadrant(taskId, newQuadrant) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            switch (newQuadrant) {
                case "Q1":
                    task.isImportant = true;
                    task.isUrgent = true;
                    break;
                case "Q2":
                    task.isImportant = true;
                    task.isUrgent = false;
                    break;
                case "Q3":
                    task.isImportant = false;
                    task.isUrgent = true;
                    break;
                case "Q4":
                    task.isImportant = false;
                    task.isUrgent = false;
                    break;
            }
            this.saveAndNotify();
        }
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveAndNotify();
        }
    }

    openTaskModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const subtasks = this.tasks.filter(t => t.parentId === taskId);
            new TaskDetailsModal(
                task,
                subtasks,
                (id, updatedData, newSubtasks) => {
                    task.update(updatedData);
                    this.tasks = this.tasks.filter(t => t.parentId !== id);

                    newSubtasks.forEach(sub => {
                        const subtaskModel = new TaskModel({
                            id: sub.id,
                            listId: task.listId,
                            parentId: task.id,
                            title: sub.title,
                            isCompleted : sub.isCompleted,
                            category: task.category
                        });
                        this.tasks.push(subtaskModel);
                    });
                    this.saveAndNotify();
                });
        }
    }

    saveAndNotify() {
        this.saveData();
        this.notifyViews();
    }

    savePetData() {
        StorageService.savePet(this.pet);
    }
}