export class StorageService {
    static LISTS_KEY = "tomodochi_lists";
    static TASKS_KEY = "tomodochi_tasks";

    static loadLists() {
        const data = localStorage.getItem(this.LISTS_KEY);
        return data ? JSON.parse(data) : [];
    }

    static saveLists(lists) {
        const listsData = lists.map(l => ({id: l.id, name: l.name}));
        localStorage.setItem(this.LISTS_KEY, JSON.stringify(listsData));
    }

    static loadTasks() {
        const data = localStorage.getItem(this.TASKS_KEY);
        return data ? JSON.parse(data) : [];
    }

    static saveTasks(tasks) {
        localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    }
}