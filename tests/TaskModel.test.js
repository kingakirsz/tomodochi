import { describe, it, expect } from "vitest";
import { TaskModel } from "../js/models/TaskModel.js";

describe("TaskModel", () => {
    describe("constructor", () => {
        it("sets provided values correctly", () => {
            const task = new TaskModel({
                id: "abc",
                listId: "list1",
                title: "Test task",
                isImportant: true,
                isUrgent: true,
                category: "Study",
                difficulty: 5,
                order: 2,
            });

            expect(task.id).toBe("abc");
            expect(task.listId).toBe("list1");
            expect(task.title).toBe("Test task");
            expect(task.isImportant).toBe(true);
            expect(task.isUrgent).toBe(true);
            expect(task.category).toBe("Study");
            expect(task.difficulty).toBe(5);
            expect(task.order).toBe(2);
        });

        it("generates a UUID when id is not provided", () => {
            const task = new TaskModel({ listId: "list1", title: "Task" });
            expect(task.id).toBeTruthy();
            expect(typeof task.id).toBe("string");
        });

        it("uses default values when optional fields are omitted", () => {
            const task = new TaskModel({ listId: "list1", title: "Task" });
            expect(task.parentId).toBeNull();
            expect(task.isImportant).toBe(false);
            expect(task.isUrgent).toBe(false);
            expect(task.dueDate).toBeNull();
            expect(task.dueTime).toBeNull();
            expect(task.status).toBe("todo");
            expect(task.order).toBe(0);
            expect(task.category).toBe("None");
            expect(task.difficulty).toBe(1);
        });

        it("sets status to done when isCompleted is true", () => {
            const task = new TaskModel({ listId: "list1", title: "Task", isCompleted: true });
            expect(task.status).toBe("done");
        });

        it("sets status to todo when isCompleted is false", () => {
            const task = new TaskModel({ listId: "list1", title: "Task", isCompleted: false });
            expect(task.status).toBe("todo");
        });

        it("uses status field when isCompleted is not provided", () => {
            const task = new TaskModel({ listId: "list1", title: "Task", status: "in-progress" });
            expect(task.status).toBe("in-progress");
        });
    });

    describe("isCompleted getter", () => {
        it("returns true when status is done", () => {
            const task = new TaskModel({ listId: "list1", title: "Task", status: "done" });
            expect(task.isCompleted).toBe(true);
        });

        it("returns false when status is not done", () => {
            const task = new TaskModel({ listId: "list1", title: "Task", status: "todo" });
            expect(task.isCompleted).toBe(false);
        });
    });

    describe("isCompleted setter", () => {
        it("sets status to done when assigned true", () => {
            const task = new TaskModel({ listId: "list1", title: "Task" });
            task.isCompleted = true;
            expect(task.status).toBe("done");
        });

        it("sets status to todo when assigned false", () => {
            const task = new TaskModel({ listId: "list1", title: "Task", status: "done" });
            task.isCompleted = false;
            expect(task.status).toBe("todo");
        });
    });

    describe("getMatrixQuadrant", () => {
        it("returns Q1 when important and urgent", () => {
            const task = new TaskModel({ listId: "l", title: "t", isImportant: true, isUrgent: true });
            expect(task.getMatrixQuadrant()).toBe("Q1");
        });

        it("returns Q2 when important and not urgent", () => {
            const task = new TaskModel({ listId: "l", title: "t", isImportant: true, isUrgent: false });
            expect(task.getMatrixQuadrant()).toBe("Q2");
        });

        it("returns Q3 when not important and urgent", () => {
            const task = new TaskModel({ listId: "l", title: "t", isImportant: false, isUrgent: true });
            expect(task.getMatrixQuadrant()).toBe("Q3");
        });

        it("returns Q4 when not important and not urgent", () => {
            const task = new TaskModel({ listId: "l", title: "t", isImportant: false, isUrgent: false });
            expect(task.getMatrixQuadrant()).toBe("Q4");
        });
    });

    describe("update", () => {
        it("updates provided fields", () => {
            const task = new TaskModel({ listId: "list1", title: "Old title", difficulty: 1 });
            task.update({ title: "New title", difficulty: 7 });
            expect(task.title).toBe("New title");
            expect(task.difficulty).toBe(7);
        });

        it("does not change fields that are not in the update", () => {
            const task = new TaskModel({ listId: "list1", title: "Title", category: "Study" });
            task.update({ title: "New title" });
            expect(task.category).toBe("Study");
        });
    });
});
