import {MainController} from "./controllers/MainController.js";
import {StorageService} from "./services/StorageService.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Aplikacja TomoDochi startuje!");

    const mainController = new MainController();

    const btnExport = document.getElementById("btn-export-save");
    const btnImport = document.getElementById("btn-import-save");
    const fileInput = document.getElementById("import-file-input");

    if (btnExport) {
        btnExport.addEventListener("click", (e) => {
            StorageService.exportToFile();
        });
    }

    if (btnImport && fileInput) {
        btnImport.addEventListener("click", (e) => {
            fileInput.click();
        });

        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                StorageService.importFromFile(file, () => {
                    alert("Import file changed successfully.TomoDachi app will restart.");
                    location.reload();
                });
            }
            e.target.value = "";
        });
    }

    const newBtn = document.getElementById("btn-new-list");
    newBtn.addEventListener("click", () => {
        const listName = prompt("Enter name for new list:");
        if (listName && listName.trim() !== "") {
            mainController.createNewList(listName.trim());
        }
    });

    if (mainController.lists.length === 0) {
        const defaultList = mainController.createNewList("Main Tasks");

    mainController.addNewTask(defaultList.id, {
        title: "Nakarm TomoDochi! (Q1)",
            description: "Jest bardzo głodny",
            isImportant: true,
            isUrgent: true
    });

    mainController.addNewTask(defaultList.id, {
        title: "Nauka do egzaminu (Q2)",
        description: "Rozdział 6 i 7",
        isImportant: true,
        isUrgent: false
    });

    mainController.addNewTask(defaultList.id, {
        title: "Odpowiedzieć na e-mail (Q3)",
        description: "Sprawa techniczna",
        isImportant: false,
        isUrgent: true
    });

    mainController.addNewTask(defaultList.id, {
        title: "Obejrzeć serial (Q4)",
        description: "Nowy odcinek",
        isImportant: false,
        isUrgent: false
    });
    }
});