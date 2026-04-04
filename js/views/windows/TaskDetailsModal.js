export class TaskDetailsModal {
    constructor(taskData, subtasksData, onSave, onClose) {
        this.taskData = taskData;
        this.tempSubtasks = subtasksData ? JSON.parse(JSON.stringify(subtasksData)) : [];
        this.onSave = onSave;
        this.onClose = onClose;

        this.initDOM();
        this.populateData();
        this.attachEvents();
    }

    initDOM() {
        const template = document.getElementById("task-details-modal-template");
        this.overlay = template.content.cloneNode(true).firstElementChild;

        this.titleInput = this.overlay.querySelector(".modal-title-input");
        this.categorySelect = this.overlay.querySelector(".modal-category-select");
        this.difficultySlider = this.overlay.querySelector(".modal-difficulty-slider");
        this.difficultyValue = this.overlay.querySelector(".difficulty-value");
        this.dateInput = this.overlay.querySelector(".modal-date-input");
        this.timeInput = this.overlay.querySelector(".modal-time-input");

        this.subtaskInput = this.overlay.querySelector(".modal-subtask-input");
        this.addSubtaskBtn = this.overlay.querySelector(".modal-add-subtask-btn");
        this.subtaskListContainer = this.overlay.querySelector(".modal-subtasks-list");

        this.saveBtn = this.overlay.querySelector(".save-modal-btn");
        this.closeBtn = this.overlay.querySelector(".close-modal-btn");

        document.body.appendChild(this.overlay);
    }

    populateData() {
        this.titleInput.value = this.taskData.title ? this.taskData.title : "";
        this.categorySelect = this.taskData.category ? this.taskData.category : "None";
        this.difficultySlider.value = this.taskData.difficultyValue ? this.taskData.difficulty : 1;
        this.difficultyValue.textContent = this.difficultySlider.value;
        this.dateInput.value = this.taskData.dueDate ? this.taskData.dueDate : "";
        this.timeInput.value = this.taskData.dueTime ? this.taskData.dueTime : "";
        this.renderSubtasks();
    }

    renderSubtasks() {
        this.subtaskListContainer.innerHTML = "";

        if (this.tempSubtasks.length === 0) {
            this.subtaskListContainer.innerHTML = "<p style='font-size: 12px; color: var(--color-secondary); text-align: center;'>No subtasks yet.</p>";
            return;
        }

        this.tempSubtasks.forEach((subtask, index) => {
            const taskDiv = document.createElement("div");
            taskDiv.className = "task-item";
            if (subtask.isCompleted) taskDiv.classList.add("completed");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = subtask.isCompleted;
            checkbox.addEventListener("change", () => {
                this.tempSubtasks[index].isCompleted = checkbox.checked;
                this.renderSubtasks();
            });

            const titleSpan = document.createElement("span");
            titleSpan.textContent = subtask.title;

            const delBtn = document.createElement("button");
            delBtn.className = "edit-task-btn";
            delBtn.textContent = "🗑️";
            delBtn.style.opacity = "1";
            delBtn.addEventListener("click", () => {
                this.tempSubtasks.splice(index, 1);
                this.renderSubtasks();
            });

            taskDiv.appendChild(checkbox);
            taskDiv.appendChild(titleSpan);
            taskDiv.appendChild(delBtn);
            this.subtaskListContainer.appendChild(taskDiv);
        });
    }

    attachEvents() {
        this.difficultySlider.addEventListener("input", (e) => {
            this.difficultyValue.textContent = e.target.value;
        });

        const handleAddSubtask = () => {
            const title = this.subtaskInput.value.trim();
            if (title) {
                this.tempSubtasks.push({
                    id: crypto.randomUUID(),
                    title: title,
                    isCompleted: false
                });
                this.subtaskInput.value = "";
                this.renderSubtasks();
            }
        };

        this.addSubtaskBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleAddSubtask();
        });

        this.subtaskInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubtask();
            }
        });

        this.closeBtn.addEventListener("click", () => this.destroy());

        this.overlay.addEventListener("mousedown", (e) => {
            if (e.target === this.overlay) this.destroy();
        });

        this.saveBtn.addEventListener("click", () => {
            const updatedData = {
                title: this.titleInput.value.trim(),
                category: this.categorySelect.value,
                difficulty: parseInt(this.difficultySlider.value),
                dueDate: this.dateInput.value,
                dueTime: this.timeInput.value
            };
            this.onSave(this.taskData.id, updatedData, this.tempSubtasks);
            this.destroy();
        });
    }

    destroy() {
        this.overlay.remove();
        if (this.onClose) this.onClose();
    }
}