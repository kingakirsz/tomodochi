import {MainController} from "./controllers/MainController.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Aplikacja TomoDochi startuje!");

    const mainController = new MainController();

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