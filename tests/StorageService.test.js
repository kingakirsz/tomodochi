import { describe, it, expect, beforeEach, vi } from "vitest";
import { StorageService } from "../js/services/StorageService.js";

const mockStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = value; },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();

global.localStorage = mockStorage;

const mockAnchor = { href: "", download: "", click: vi.fn() };
global.document = {
    createElement: vi.fn(() => mockAnchor),
    body: { appendChild: vi.fn(), removeChild: vi.fn() },
};
global.URL = { createObjectURL: vi.fn(() => "blob:mock"), revokeObjectURL: vi.fn() };
global.Blob = function(content, opts) { this.content = content; this.opts = opts; };

describe("StorageService", () => {
    beforeEach(() => {
        mockStorage.clear();
    });

    describe("saveLists / loadLists", () => {
        it("saves and loads a list correctly", () => {
            const lists = [{ id: "1", name: "Work", todoWindow: null }];
            StorageService.saveLists(lists);
            const loaded = StorageService.loadLists();
            expect(loaded).toEqual([{ id: "1", name: "Work" }]);
        });

        it("strips window instance fields when saving", () => {
            const lists = [{ id: "1", name: "Work", todoWindow: {}, matrixWindow: {}, kanbanWindow: {} }];
            StorageService.saveLists(lists);
            const loaded = StorageService.loadLists();
            expect(loaded[0]).not.toHaveProperty("todoWindow");
            expect(loaded[0]).not.toHaveProperty("matrixWindow");
            expect(loaded[0]).not.toHaveProperty("kanbanWindow");
        });

        it("returns an empty array when nothing is saved", () => {
            expect(StorageService.loadLists()).toEqual([]);
        });

        it("saves and loads multiple lists", () => {
            const lists = [
                { id: "1", name: "Work" },
                { id: "2", name: "Personal" },
            ];
            StorageService.saveLists(lists);
            const loaded = StorageService.loadLists();
            expect(loaded).toHaveLength(2);
            expect(loaded[1].name).toBe("Personal");
        });
    });

    describe("saveTasks / loadTasks", () => {
        it("saves and loads tasks correctly", () => {
            const tasks = [{ id: "t1", title: "Buy milk", listId: "l1" }];
            StorageService.saveTasks(tasks);
            const loaded = StorageService.loadTasks();
            expect(loaded).toEqual(tasks);
        });

        it("returns an empty array when nothing is saved", () => {
            expect(StorageService.loadTasks()).toEqual([]);
        });

        it("saves and loads multiple tasks", () => {
            const tasks = [
                { id: "t1", title: "Task 1", listId: "l1" },
                { id: "t2", title: "Task 2", listId: "l1" },
            ];
            StorageService.saveTasks(tasks);
            expect(StorageService.loadTasks()).toHaveLength(2);
        });
    });

    describe("savePet / loadPet", () => {
        it("saves and loads pet data correctly", () => {
            const pet = { energy: 80, points: 150, happiness: 5 };
            StorageService.savePet(pet);
            const loaded = StorageService.loadPet();
            expect(loaded).toEqual(pet);
        });

        it("returns an empty object when nothing is saved", () => {
            expect(StorageService.loadPet()).toEqual({});
        });
    });

    describe("exportToFile", () => {
        it("creates a download link and clicks it", () => {
            StorageService.saveLists([{ id: "1", name: "Work" }]);
            StorageService.saveTasks([{ id: "t1", title: "Task" }]);
            StorageService.savePet({ energy: 100 });

            StorageService.exportToFile();

            expect(global.document.createElement).toHaveBeenCalledWith("a");
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
        });

        it("sets a filename containing the current date", () => {
            StorageService.exportToFile();
            const today = new Date().toISOString().slice(0, 10);
            expect(mockAnchor.download).toContain(today);
            expect(mockAnchor.download).toContain("tomodochi_save");
        });
    });

    describe("importFromFile", () => {
        it("calls onSuccess and saves data when file is valid", () => {
            const data = {
                lists: [{ id: "1", name: "Work" }],
                tasks: [{ id: "t1", title: "Task" }],
                pet: { energy: 90 },
            };
            global.alert = vi.fn();
            global.FileReader = function() {
                this.onload = null;
                this.readAsText = () => {
                    this.onload({ target: { result: JSON.stringify(data) } });
                };
            };

            const onSuccess = vi.fn();
            StorageService.importFromFile({}, onSuccess);

            expect(onSuccess).toHaveBeenCalled();
            expect(StorageService.loadPet()).toEqual({ energy: 90 });
        });

        it("shows an alert when the file is missing required fields", () => {
            const invalidData = { lists: [], tasks: [] };
            global.alert = vi.fn();
            global.FileReader = function() {
                this.onload = null;
                this.readAsText = () => {
                    this.onload({ target: { result: JSON.stringify(invalidData) } });
                };
            };

            const onSuccess = vi.fn();
            StorageService.importFromFile({}, onSuccess);

            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("not a valid"));
            expect(onSuccess).not.toHaveBeenCalled();
        });

        it("shows an alert when the file content is not valid JSON", () => {
            global.alert = vi.fn();
            global.FileReader = function() {
                this.onload = null;
                this.readAsText = () => {
                    this.onload({ target: { result: "not json{{" } });
                };
            };

            StorageService.importFromFile({}, vi.fn());

            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("corrupted"));
        });
    });
});
