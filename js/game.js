const ALPHABET = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

class GameManager {
    constructor() {
        this.state = null;
        this.activeRouletteIndex = 0;
        this.activeLetter = null;
        this.bibleTimerInterval = null;
        this.bibleTimerLetter = null;



        this.clearBibleTimer();
        this.state = gameState;
        this.activeRouletteIndex = 0;
        this.activeLetter = null;
    }

    getCurrentRoulette() {
        if (!this.state || !this.state.roulettes) return null;
        return this.state.roulettes[this.activeRouletteIndex];
    }

    selectLetter(letter) {
        if (this.bibleTimerInterval && letter !== this.bibleTimerLetter) {
            this.setWildcardStatus("Termina la consulta bíblica antes de cambiar de pregunta.");
            return;
        }

        this.activeLetter = letter;
        const roulette = this.getCurrentRoulette();
        const item = roulette.questions.find(q => q.letra === letter);

        document.getElementById("label-current-letter").textContent = `Letra: ${letter}`;
        document.getElementById("center-current-letter").textContent = letter;

        if (item) {
            const hint = item.pista === "empieza"
                ? `EMPIEZA POR ${letter}: `
                : item.pista === "contiene"
                    ? `CONTIENE ${letter}: `
                    : "";
            document.getElementById("text-question").textContent = `${hint}${item.pregunta || "Sin pregunta asignada."}`;
            document.getElementById("text-answer").textContent = item.respuesta || "Sin respuesta asignada.";
            this.setWildcardStatus(item.status === "pending"
                ? "Usa cualquiera de los comodines disponibles antes de responder."
                : "Los comodines solo se pueden usar antes de responder.");
        } else {
            document.getElementById("text-question").textContent = "No hay datos configurados para esta letra.";
            document.getElementById("text-answer").textContent = "-";
            this.setWildcardStatus("No hay una pregunta para esta letra.");
        }

        document.getElementById("answer-container").classList.add("hidden");
        document.getElementById("btn-show-answer").disabled = !item;
        document.getElementById("btn-mark-correct").disabled = !item;
        document.getElementById("btn-mark-pass").disabled = !item;
        this.updateWildcardControls();

        document.querySelectorAll(".roulette-letter-node").forEach(node => {
            node.classList.remove("active-selection");
            if (node.dataset.letter === letter) {
                node.classList.add("active-selection");
            }
        });
    }

    markState(status) {
        if (!this.activeLetter) return;
        const roulette = this.getCurrentRoulette();
        const item = roulette.questions.find(q => q.letra === this.activeLetter);
        if (item) {
            item.status = status;
            StorageManager.saveGame(this.state);
            this.renderWheel();
            this.selectLetter(this.activeLetter);
        }
    }

    setWildcardStatus(message) {
        document.getElementById("wildcard-status").textContent = message;
    }

    updateWildcardControls() {
        const roulette = this.getCurrentRoulette();
        const item = roulette?.questions.find(question => question.letra === this.activeLetter);
        const wildcardUsed = roulette?.wildcardsUsed || {};
        const timerActive = Boolean(this.bibleTimerInterval);

        document.querySelectorAll("[data-wildcard]").forEach(button => {
            const type = button.dataset.wildcard;
            button.disabled = !item
                || item.status !== "pending"
                || Boolean(wildcardUsed[type])
                || timerActive;
        });

        document.querySelectorAll(".tab-btn").forEach(button => {
            button.disabled = timerActive;
        });
        ["btn-show-answer", "btn-mark-correct", "btn-mark-pass"].forEach(id => {
            const button = document.getElementById(id);
            button.disabled = !item || item.status !== "pending" || timerActive;
        });
    }

    clearBibleTimer() {
        if (this.bibleTimerInterval) {
            window.clearInterval(this.bibleTimerInterval);
            this.bibleTimerInterval = null;
        }
        this.bibleTimerLetter = null;

        const timer = document.getElementById("wildcard-timer");
        if (timer) timer.textContent = "";
    }

    startBibleTimer() {
        const timer = document.getElementById("wildcard-timer");
        let secondsRemaining = 60;
        this.bibleTimerLetter = this.activeLetter;

        const updateTimer = () => {
            timer.textContent = `Tiempo para consultar la Biblia: ${secondsRemaining} s`;
            if (secondsRemaining === 0) {
                this.clearBibleTimer();
                this.setWildcardStatus("Terminó el tiempo de consulta. Ya puedes responder.");
                this.updateWildcardControls();
                return;
            }
            secondsRemaining -= 1;
        };

        updateTimer();
        this.bibleTimerInterval = window.setInterval(updateTimer, 1000);
        this.updateWildcardControls();
    }

    useWildcard(type) {
        const roulette = this.getCurrentRoulette();
        const item = roulette?.questions.find(question => question.letra === this.activeLetter);
        if (!roulette || !item || !this.activeLetter) {
            this.setWildcardStatus("Primero selecciona una pregunta.");
            return;
        }
        if (item.status !== "pending") {
            this.setWildcardStatus("Los comodines solo se pueden usar antes de responder.");
            return;
        }

        roulette.wildcardsUsed ||= {};
        if (roulette.wildcardsUsed[type]) {
            this.setWildcardStatus("Ese comodín ya se usó en esta ruleta.");
            this.updateWildcardControls();
            return;
        }
        let statusMessage;
        if (type === "pass") {
            statusMessage = "Pasa esta pregunta al compañero que sigue detrás en el orden del equipo.";
        } else if (type === "choose") {
            const teammate = window.prompt("¿Qué compañero de tu equipo responderá?");
            if (!teammate?.trim()) return;
            statusMessage = `Pregunta asignada a ${teammate.trim()}. Responde por el equipo.`;
        } else if (type === "bible") {
            statusMessage = "Consulta la Biblia para responder.";
        } else {
            return;
        }

        roulette.wildcardsUsed[type] = true;
        this.setWildcardStatus(statusMessage);
        StorageManager.saveGame(this.state);
        this.updateWildcardControls();

        if (type === "bible") this.startBibleTimer();
    }

    renderWheel() {
        const wheel = document.getElementById("roulette-wheel");
        wheel.innerHTML = "";
        const roulette = this.getCurrentRoulette();
        if (!roulette) return;

        const letters = roulette.questions.map(q => q.letra);
        const total = letters.length;
        const radius = 150;
        const centerX = wheel.clientWidth / 2 || 190;
        const centerY = wheel.clientHeight / 2 || 190;

        letters.forEach((letter, index) => {
            const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const node = document.createElement("div");
            node.className = "roulette-letter-node";
            node.style.left = `${x}px`;
            node.style.top = `${y}px`;
            node.textContent = letter;
            node.dataset.letter = letter;

            const item = roulette.questions.find(q => q.letra === letter);
            if (item) {
                if (item.status === "correct") node.classList.add("state-correct");
                if (item.status === "pass") node.classList.add("state-pass");
            }

            node.addEventListener("click", () => {
                this.selectLetter(letter);
            });

            wheel.appendChild(node);
        });
    }

    renderTabs() {
        const tabsContainer = document.getElementById("roulette-tabs");
        tabsContainer.innerHTML = "";
        if (!this.state || !this.state.roulettes) return;

        this.state.roulettes.forEach((roulette, index) => {
            const btn = document.createElement("button");
            btn.className = `tab-btn ${index === this.activeRouletteIndex ? 'active' : ''}`;
            btn.textContent = roulette.name;
            btn.addEventListener("click", () => {
                if (this.bibleTimerInterval) {
                    this.setWildcardStatus("Termina la consulta bíblica antes de cambiar de equipo.");
                    return;
                }
                this.activeRouletteIndex = index;
                this.activeLetter = null;
                this.renderTabs();
                this.renderWheel();
                document.getElementById("label-current-letter").textContent = "Letra: -";
                document.getElementById("center-current-letter").textContent = "-";
                document.getElementById("text-question").textContent = "Selecciona una letra en la ruleta para ver la pregunta.";
                document.getElementById("answer-container").classList.add("hidden");
                document.getElementById("btn-show-answer").disabled = true;
                document.getElementById("btn-mark-correct").disabled = true;
                document.getElementById("btn-mark-pass").disabled = true;
                this.setWildcardStatus("Selecciona una pregunta para usar un comodín.");
                this.updateWildcardControls();
            });
            tabsContainer.appendChild(btn);
        });
        this.updateWildcardControls();
    }

    resetCurrentRoulette() {
        if (confirm("¿Estás seguro de reiniciar el progreso de esta ruleta?")) {
            this.clearBibleTimer();
            const roulette = this.getCurrentRoulette();
            if (roulette && roulette.questions) {
                roulette.questions.forEach(q => q.status = "pending");
                roulette.questions.forEach(q => delete q.wildcardUsed);
                roulette.wildcardsUsed = {};
                StorageManager.saveGame(this.state);
                this.renderWheel();
                if (this.activeLetter) this.selectLetter(this.activeLetter);
                this.setWildcardStatus("Los comodines de esta ruleta están disponibles nuevamente.");
                this.updateWildcardControls();
            }
        }
    }
}

const gameManager = new GameManager();