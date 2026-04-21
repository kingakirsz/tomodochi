let zIndexCounter = 100;

export class BaseWindow {
    constructor(windowElement) {
        this.element = windowElement;
        this.header = this.element.querySelector('.window-header');
        this.resizeHandle = this.element.querySelector('.resize-handle');
        this.closeBtn = this.element.querySelector('.close-btn');

        this.isDragging = false;
        this.isResizing = false;

        this.onMouseMoveDrag = this.onMouseMoveDrag.bind(this);
        this.onMouseUpDrag = this.onMouseUpDrag.bind(this);
        this.onMouseMoveResize = this.onMouseMoveResize.bind(this);
        this.onMouseUpResize = this.onMouseUpResize.bind(this);

        this.initDrag();
        this.initResize();
        this.initVisibility();
    }

    initDrag() {
        this.header.addEventListener('mousedown', (e) => {
            if (e.target === this.closeBtn) return;

            this.isDragging = true;
            this.offsetX = e.clientX - this.element.offsetLeft;
            this.offsetY = e.clientY - this.element.offsetTop;
            this.header.style.cursor = 'grabbing';
            this.bringToFront();

            document.addEventListener('mousemove', this.onMouseMoveDrag);
            document.addEventListener('mouseup', this.onMouseUpDrag);
        });
    }

    onMouseMoveDrag(e) {
        if (!this.isDragging) return;
        let newX = e.clientX - this.offsetX;
        let newY = e.clientY - this.offsetY;
        this.element.style.left = `${newX}px`;
        this.element.style.top = `${newY}px`;
    }

    onMouseUpDrag() {
        this.isDragging = false;
        this.header.style.cursor = 'grab';

        document.removeEventListener('mousemove', this.onMouseMoveDrag);
        document.removeEventListener('mouseup', this.onMouseUpDrag);
    }

    initResize() {
        if(!this.resizeHandle) return;

        this.resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.isResizing = true;

            const rect = this.element.getBoundingClientRect();
            this.startWidth = rect.width;
            this.startHeight = rect.height;
            this.startX = e.clientX;
            this.startY = e.clientY;

            this.bringToFront();

            document.addEventListener('mousemove', this.onMouseMoveResize);
            document.addEventListener('mouseup', this.onMouseUpResize);
        });
    }

    onMouseMoveResize(e) {
        if (!this.isResizing) return;

        const newWidth = this.startWidth + (e.clientX - this.startX);
        const newHeight = this.startHeight + (e.clientY - this.startY);

        this.element.style.width = `${newWidth}px`;
        this.element.style.height = `${newHeight}px`;
    }

    onMouseUpResize () {
        this.isResizing = false;
        document.removeEventListener("mousemove", this.onMouseMoveResize);
        document.removeEventListener("mouseup", this.onMouseUpResize);
    }

    initVisibility() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => this.hide());
        }
        this.element.addEventListener("mousedown", () => this.bringToFront());
    }

    hide() {
        this.element.style.display = "none";
    }

    show() {
        this.element.style.display = "flex";
        this.bringToFront();
    }

    toggleVisibility() {
        if (this.element.style.display === "none") {
            this.show();
        } else {
            this.hide();
        }
    }

    bringToFront() {
        zIndexCounter++;
        this.element.style.zIndex = zIndexCounter;
    }

    setTitle(newTitle) {
        const titleEl = this.element.querySelector('.window-title');
        if (titleEl) {
            titleEl.textContent = newTitle;
        }
    }
}