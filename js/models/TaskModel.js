export class TaskModel {
    constructor({
        id,
        listId,
        parentId = null,
        title,
        description,
        isImportant = false,
        isUrgent = false,
        dueDate = null,
        dueTime = null,
        status = "todo",
        isCompleted,
        order = 0,
        category = "None",
        difficulty = 1,
    }) {
        this.id = id || crypto.randomUUID();
        this.listId = listId;
        this.parentId = parentId;
        this.title = title;
        this.description = description;
        this.isImportant = isImportant;
        this.isUrgent = isUrgent;
        this.dueDate = dueDate;
        this.dueTime = dueTime;
        this.order = order;
        this.category = category;
        this.difficulty = difficulty;

        if (isCompleted !== undefined) {
            this.status = isCompleted ? "done" : "todo";
        } else {
            this.status = status;
        }
    }

    get isCompleted() {
        return this.status === "done";
    }

    set isCompleted(value) {
        this.status = value ? "done" : "todo";
    }

    getMatrixQuadrant() {
        if (this.isImportant && this.isUrgent) return 'Q1';
        if (this.isImportant && !this.isUrgent) return 'Q2';
        if (!this.isImportant && this.isUrgent) return 'Q3';
        return 'Q4';
    }

    update(updates) {
        Object.assign(this, updates);
    }
}