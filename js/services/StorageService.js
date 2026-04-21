export class StorageService {
    static LISTS_KEY = "tomodochi_lists";
    static TASKS_KEY = "tomodochi_tasks";
    static PET_KEY = "tomodochi_pet";

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

    static loadPet() {
        const data = localStorage.getItem(this.PET_KEY);
        return data ? JSON.parse(data) : {};
    }

    static savePet(pet) {
        localStorage.setItem(this.PET_KEY, JSON.stringify(pet));
    }

    static exportToFile() {
        const data = {
            lists: this.loadLists(),
            tasks: this.loadTasks(),
            pet: this.loadPet()
        };

        const jsonString = JSON.stringify(data, null, 2);

        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        const now = new Date();
        const date = now.toISOString().slice(0, 10);
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const time = `${hours}-${minutes}`;

        a.download = `tomodochi_save_${date}_${time}.json`;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static importFromFile(file, onSuccess) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.lists && data.tasks && data.pet) {
                    this.saveLists(data.lists);
                    this.saveTasks(data.tasks);
                    this.savePet(data.pet);

                    if (onSuccess) onSuccess();
                } else {
                    alert("Error: This is not a valid TomoDochi save file!")
                }
            } catch (error) {
                alert("Error: Could not import the save file! It might be corrupted.");
                console.error(error);
            }
        };
        reader.readAsText(file);
    }
}