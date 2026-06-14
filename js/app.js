import {MainController} from "./controllers/MainController.js";
import {StorageService} from "./services/StorageService.js";

document.addEventListener("DOMContentLoaded", () => {

    const mainController = new MainController();

    const btnExport = document.getElementById("btn-export-save");
    const btnImport = document.getElementById("btn-import-save");
    const fileInput = document.getElementById("import-file-input");

    if (btnExport) {
        btnExport.addEventListener("click", () => {
            StorageService.exportToFile();
        });
    }

    if (btnImport && fileInput) {
        btnImport.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                StorageService.importFromFile(file, () => {
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

    window.tomoDev = {
        help: () => {
            console.log("TomoDochi Dev Console Commands:");
            console.log(" - tomoDev.addPoints(n)     : Add n points");
            console.log(" - tomoDev.setEnergy(n)     : Set energy to n (0-100)");
            console.log(" - tomoDev.forceNewDay()    : Force a daily reset");
            console.log(" - tomoDev.resetPoints()    : Set points to 0");
            console.log(" - tomoDev.resetEnergy()    : Restore energy to 100");
            console.log(" - tomoDev.maxStat(name)    : Set a specific stat to 100");
            console.log(" - tomoDev.resetStat(name)  : Set a specific stat to 0");
            console.log(" - tomoDev.resetStats()     : Reset all pet shape/texture stats to 0");
            console.log(" - tomoDev.resetLists()     : Delete all to-do lists and tasks");
            console.log(" - tomoDev.factoryReset()   : Wipe ALL data and reload");
            console.log("Available stats: stickiness, translucency, doughiness, bounciness, powderiness, sweetness, softness, subtlety, squishiness, chewiness");
        },
        maxStat: (statName) => {
            const pet = mainController.pet;
            if (pet.shapeStats.hasOwnProperty(statName)) {
                pet.shapeStats[statName] = 100;
            } else if (pet.textureStats.hasOwnProperty(statName)) {
                pet.textureStats[statName] = 100;
            } else {
                console.warn(`Stat "${statName}" not found.`);
                return;
            }
            mainController.pet.checkEvolution();
            mainController.savePetData();
            mainController.notifyViews();
            console.log(`Stat "${statName}" set to 100.`);
        },
        resetStat: (statName) => {
            const pet = mainController.pet;
            if (pet.shapeStats.hasOwnProperty(statName)) {
                pet.shapeStats[statName] = 0;
            } else if (pet.textureStats.hasOwnProperty(statName)) {
                pet.textureStats[statName] = 0;
            } else {
                console.warn(`Stat "${statName}" not found.`);
                return;
            }
            mainController.pet.checkEvolution();
            mainController.savePetData();
            mainController.notifyViews();
            console.log(`Stat "${statName}" reset to 0.`);
        },
        addPoints: (amount) => {
            mainController.pet.points += amount;
            mainController.savePetData();
            mainController.notifyViews();
            console.log(`Added ${amount} points. Total: ${mainController.pet.points}`);
        },
        setEnergy: (level) => {
            mainController.pet.energy = Math.max(0, Math.min(100, level));
            mainController.savePetData();
            mainController.notifyViews();
            console.log(`Energy set to ${mainController.pet.energy}`);
        },
        forceNewDay: () => {
            mainController.pet.lastLogin = "force_reset";
            mainController.pet.checkDailyReset();
            mainController.savePetData();
            mainController.notifyViews();
            console.log("New day forced. Energy restored and craving randomized.");
        },
        resetPoints: () => {
            mainController.pet.points = 0;
            mainController.savePetData();
            mainController.notifyViews();
            console.log("Points reset to 0.");
        },
        resetEnergy: () => {
            mainController.pet.energy = 100;
            mainController.savePetData();
            mainController.notifyViews();
            console.log("Energy restored to 100.");
        },
        resetStats: () => {
            mainController.pet.shapeStats = {
                stickiness: 0, translucency: 0, doughiness: 0, bounciness: 0, powderiness: 0
            };
            mainController.pet.textureStats = {
                sweetness: 0, softness: 0, subtlety: 0, squishiness: 0, chewiness: 0
            };
            mainController.pet.checkEvolution();
            mainController.savePetData();
            mainController.notifyViews();
            console.log("Pet stats reset to 0.");
        },
        resetLists: () => {
            if (confirm("Delete all lists and tasks?")) {
                mainController.lists.forEach(list => {
                    if (list.todoWindow) list.todoWindow.element.remove();
                    if (list.matrixWindow) list.matrixWindow.element.remove();
                    if (list.kanbanWindow) list.kanbanWindow.element.remove();
                });
                mainController.lists = [];
                mainController.tasks = [];
                mainController.menuContainer.innerHTML = "";
                mainController.saveData();
                mainController.notifyViews();
                console.log("All lists and tasks deleted.");
            }
        },
        factoryReset: () => {
            if (confirm("WARNING: This will wipe ALL game data. Proceed?")) {
                localStorage.clear();
                location.reload();
            }
        },
        inspect: mainController
    };

    console.log("Dev Console loaded! Type 'tomoDev.help()' to see available commands.");
});