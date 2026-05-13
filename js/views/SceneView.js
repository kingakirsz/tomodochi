export class SceneView {
    constructor(speechBubble = null) {
        this.petEl = document.getElementById("pet");
        this.sceneEl = document.getElementById("scene");
        this.speechBubble = speechBubble;
        this.currentState = "state-idle";

        this.walking = false;
        this.walkRafId = null;
        this.walkX = 5;
        this.walkDir = 1;
        this.walkBounceT = 0;
        this.walkYPct = 0.20;
        this.walkYt = 0;
        this.lastTs = null;

        this.petEl.classList.add("state-idle");
        this._setupDrag();
        this._startWalk();
    }

    update(pet) {
        this.updateSprite(pet.currentEvolution);
        this.updateState(pet.energy);
    }

    updateSprite(evolution) {
        const { type, variant } = evolution;
        const path = `assets/sprites/pets/${type}_${variant}.png`;

        const img = new Image();
        img.onload = () => {
            this.petEl.style.backgroundImage = `url('${path}')`;
            this.petEl.classList.add("has-sprite");
        };
        img.onerror = () => {
            this.petEl.style.backgroundImage = "none";
            this.petEl.classList.remove("has-sprite");
        };
        img.src = path;
    }

    updateState(energy) {
        const newState = energy <= 20 ? "state-tired" : "state-idle";
        if (this.currentState === newState) return;

        this.currentState = newState;
        this.petEl.classList.remove("state-idle", "state-tired", "state-happy");
        this.petEl.classList.add(newState);

        if (newState === "state-idle") {
            this._startWalk();
        } else {
            this._stopWalk();
        }
    }

    triggerHappy() {
        this._stopWalk();
        this.petEl.classList.remove("state-idle", "state-tired");
        this.petEl.classList.add("state-happy");

        setTimeout(() => {
            this.petEl.classList.remove("state-happy");
            this.petEl.classList.add(this.currentState);
            if (this.currentState === "state-idle") {
                this._startWalk();
            }
        }, 1500);
    }

    _startWalk() {
        if (this.walking) return;
        this.walking = true;
        this.lastTs = null;
        this.walkRafId = requestAnimationFrame(ts => this._walkLoop(ts));
    }

    _stopWalk() {
        this.walking = false;
        if (this.walkRafId) {
            cancelAnimationFrame(this.walkRafId);
            this.walkRafId = null;
        }
        this.petEl.style.transform = "";
        if (this.speechBubble) {
            const petBottomPx = this.walkYPct * this.sceneEl.offsetHeight;
            this.speechBubble.setAnchorX(this.walkX, petBottomPx);
        }
    }

    _setupDrag() {
        this.petEl.addEventListener("mousedown", e => {
            e.preventDefault();
            this._stopWalk();
            this.petEl.classList.add("dragging");

            const sceneRect = this.sceneEl.getBoundingClientRect();
            const minBottom = sceneRect.height * 0.08;
            const maxBottom = sceneRect.height * 0.30;
            let lastBottomPx = this.walkYPct * sceneRect.height;

            const onMove = e => {
                const rawX = ((e.clientX - sceneRect.left - 64) / sceneRect.width) * 100;
                this.walkX = Math.max(0, Math.min(88, rawX));

                const rawBottom = sceneRect.bottom - e.clientY - 64;
                const clampedBottom = Math.max(minBottom, Math.min(maxBottom, rawBottom));
                lastBottomPx = clampedBottom;

                this.petEl.style.left = `${this.walkX}%`;
                this.petEl.style.bottom = `${clampedBottom}px`;
                this.petEl.style.transform = `scaleX(${this.walkDir})`;
                if (this.speechBubble) this.speechBubble.setAnchorX(this.walkX, clampedBottom);
            };

            const onUp = () => {
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
                this.petEl.classList.remove("dragging");
                this.walkYPct = lastBottomPx / sceneRect.height;
                if (this.speechBubble) this.speechBubble.resetAnchor();
                if (this.currentState === "state-idle") this._startWalk();
            };

            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
        });
    }

    _walkLoop(ts) {
        if (!this.walking) return;

        if (this.lastTs !== null) {
            const dt = (ts - this.lastTs) / 1000;
            const WALK_SPEED = 6;
            const BOUNCE_FREQ = Math.PI * 2.5;
            const BOUNCE_HEIGHT = 8;
            const WALK_Y_CENTER = 0.20;
            const WALK_Y_AMP = 0.08;
            const WALK_Y_FREQ = Math.PI * 0.2;

            this.walkX += this.walkDir * WALK_SPEED * dt;
            this.walkBounceT += dt;
            this.walkYt += dt;

            if (this.walkX >= 85) { this.walkX = 85; this.walkDir = -1; }
            if (this.walkX <= 5)  { this.walkX = 5;  this.walkDir = 1; }

            const targetYPct = WALK_Y_CENTER + Math.sin(this.walkYt * WALK_Y_FREQ) * WALK_Y_AMP;
            this.walkYPct += (targetYPct - this.walkYPct) * Math.min(1, dt * 1.5);

            const bounceY = Math.abs(Math.sin(this.walkBounceT * BOUNCE_FREQ)) * -BOUNCE_HEIGHT;
            const petBottomPx = this.walkYPct * this.sceneEl.offsetHeight;

            this.petEl.style.left = `${this.walkX}%`;
            this.petEl.style.bottom = `${this.walkYPct * 100}%`;
            this.petEl.style.transform = `translateY(${bounceY}px) scaleX(${this.walkDir})`;
            if (this.speechBubble) this.speechBubble.setAnchorX(this.walkX, petBottomPx);
        }

        this.lastTs = ts;
        this.walkRafId = requestAnimationFrame(ts => this._walkLoop(ts));
    }
}