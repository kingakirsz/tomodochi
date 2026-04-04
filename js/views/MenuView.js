export class MenuView {
    constructor(menuContainer, listCallbacks) {
        this.menuContainer = menuContainer;
        this.listCallbacks = listCallbacks;
    }

    buildMenuButton(listObj) {
        const wrapper = document.createElement("div");
        wrapper.className = "dropdown-item";
        wrapper.dataset.listId = listObj.id;

        const nameSpan = document.createElement("span");
        nameSpan.textContent = listObj.name;
        nameSpan.style.flexGrow = "1";

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "list-actions";

        const todoBtn = this.createIconBtn("📝", "Toggle To-Do", (e) => {
            e.stopPropagation();
            listObj.todoWindow.toggleVisibility();
        });

        const matrixBtn = this.createIconBtn("📊", "Toggle Matrix", (e) => {
            e.stopPropagation();
            listObj.matrixWindow.toggleVisibility();
        });

        const kanbanBtn = this.createIconBtn("📋", "Toggle Kanban", (e) => {
            e.stopPropagation();
            listObj.kanbanWindow.toggleVisibility();
        });

        const editBtn = this.createIconBtn("✏️", "Edit name", (e) => {
            e.stopPropagation();
            const newName = prompt("Enter new name for list:", listObj.name);
            if (newName && newName.trim() !== "") {
                this.listCallbacks.onRename(listObj.id, newName.trim());
            }
        });

        const deleteBtn = this.createIconBtn("🗑️", "Delete list", (e) => {
            e.stopPropagation();
            if(confirm(`Are you sure you want to delete the list "${listObj.name}" and all of its tasks?`)) {
                this.listCallbacks.onDelete(listObj.id);
            }
        });

        actionsDiv.append(todoBtn, matrixBtn, kanbanBtn, editBtn, deleteBtn);
        wrapper.append(nameSpan, actionsDiv);

        this.menuContainer.appendChild(wrapper);
    }

    createIconBtn(icon, title, onClick) {
        const btn = document.createElement("button");
        btn.className = "icon-btn";
        btn.textContent = icon;
        btn.title = title;
        btn.onclick = onClick;
        return btn;
    }
}