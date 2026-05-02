import { PET_QUOTES } from "../utils/petQuotes.js";

export class SpeechBubbleView {
    constructor() {
        this.bubble = document.getElementById("speech-bubble");
        this.textEl = document.getElementById("speech-bubble-text");
        this.timer = null;
        this.queue = [];
        this.isShowing = false;
    }

    show(message, duration = 3000) {
        this.queue.push({ message, duration });
        if (!this.isShowing) {
            this._showNext();
        }
    }

    showRandom(duration = 3000) {
        const quote = PET_QUOTES[Math.floor(Math.random() * PET_QUOTES.length)];
        this.show(quote, duration);
    }

    _showNext() {
        if (this.queue.length === 0) {
            this.isShowing = false;
            return;
        }

        this.isShowing = true;
        const { message, duration } = this.queue.shift();

        this.textEl.textContent = message;
        this.bubble.classList.remove("hidden");

        this.timer = setTimeout(() => {
            this.bubble.classList.add("hidden");
            setTimeout(() => this._showNext(), 400); // wait for fade
        }, duration);
    }

    clear() {
        this.queue = [];
        if (this.timer) clearTimeout(this.timer);
        this.bubble.classList.add("hidden");
        this.isShowing = false;
    }
}