document.addEventListener("DOMContentLoaded", () => {
    const views = {
        main: document.getElementById("view-main-menu"),
        setup: document.getElementById("view-setup"),
        game: document.getElementById("view-game")
    };

    function switchView(viewName) {
        Object.values(views).forEach(v => v.classList.remove("active"));
        if (views[viewName]) {
            views[viewName].classList.add("active");
        }
    }

    function showGame(gameState) {
        gameManager.initGame(gameState);
        document.getElementById("display-game-name").textContent = gameState.name || "Pasapalabras";
        switchView("game");
        gameManager.renderTabs();
        gameManager.renderWheel();
    }

    function getAnswerHint(letter, answer) {
        const normalizedLetter = letter.normalize("NFC").trim().toLocaleUpperCase("es");
        const normalizedAnswer = answer.normalize("NFC").trim().toLocaleUpperCase("es");

        if (normalizedAnswer.startsWith(normalizedLetter)) return "empieza";
        if (normalizedAnswer.includes(normalizedLetter)) return "contiene";
        return null;
    }

    function parseTextGame(text, fileName) {
        const normalizedText = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();
        if (!normalizedText) throw new Error("El archivo está vacío.");

        const blocks = normalizedText.split(/\n\s*\n/).filter(block => block.trim());
        const roulettesByName = new Map();

        blocks.forEach((block, index) => {
            const fields = {};
            const lines = block.split("\n").map(line => line.trim()).filter(Boolean);

            for (const line of lines) {
                const match = line.match(/^(RULETA|LETRA|PREGUNTA|RESPUESTA|CITA(?:\s+BÍBLICA)?)\s*:\s*(.*)$/i);
                if (!match) {
                    throw new Error(`Bloque ${index + 1}: usa RULETA:, LETRA:, PREGUNTA:, RESPUESTA: y, opcionalmente, CITA: o CITA BÍBLICA:.`);
                }

                const label = match[1].toLocaleLowerCase("es");
                const field = label.startsWith("cita") ? "cita" : label;
                if (Object.hasOwn(fields, field)) {
                    throw new Error(`Bloque ${index + 1}: la etiqueta ${match[1].toUpperCase()} está repetida.`);
                }
                fields[field] = match[2].trim();
            }

            if (!fields.letra || !fields.pregunta || !fields.respuesta) {
                throw new Error(`Bloque ${index + 1}: completa LETRA, PREGUNTA y RESPUESTA.`);
            }

            const rouletteName = fields.ruleta || "Ruleta 1";
            const rouletteKey = rouletteName.toLocaleLowerCase("es");
            if (!roulettesByName.has(rouletteKey)) {
                roulettesByName.set(rouletteKey, {
                    name: rouletteName,
                    questions: [],
                    usedLetters: new Set()
                });
            }

            const roulette = roulettesByName.get(rouletteKey);
            const letra = fields.letra.normalize("NFC").toLocaleUpperCase("es");
            if (!ALPHABET.includes(letra)) {
                throw new Error(`Bloque ${index + 1}: la letra ${fields.letra} no está disponible en la ruleta.`);
            }
            if (roulette.usedLetters.has(letra)) {
                throw new Error(`Bloque ${index + 1}: la letra ${letra} aparece más de una vez en ${roulette.name}.`);
            }
            roulette.usedLetters.add(letra);

            const pista = getAnswerHint(letra, fields.respuesta);
            const isSurprise = letra === "W" && /^SORPRESA\s*:/i.test(fields.pregunta);
            if (!pista && !isSurprise) {
                throw new Error(`Bloque ${index + 1}: la respuesta no empieza ni contiene la letra ${letra}.`);
            }

            roulette.questions.push({
                letra,
                pregunta: fields.pregunta,
                respuesta: fields.respuesta,
                cita: fields.cita || "",
                pista: pista || "",
                status: "pending"
            });
        });

        return {
            name: fileName.replace(/\.txt$/i, "").trim() || "Partida importada",
            roulettes: Array.from(roulettesByName.values(), ({ name, questions }) => ({ name, questions }))
        };
    }

    document.getElementById("btn-goto-setup").addEventListener("click", () => {
        setupDefaultConfigForm();
        switchView("setup");
    });

    document.getElementById("btn-goto-load").addEventListener("click", () => {
        const savedGame = StorageManager.loadGame();
        if (savedGame) {
            showGame(savedGame);
        } else {
            alert("No se encontró ninguna partida guardada en el almacenamiento local.");
        }
    });

    const fileInput = document.getElementById("import-file-input");
    document.getElementById("btn-import-game").addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        fileInput.value = "";
        if (file) {
            if (/\.txt$/i.test(file.name)) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const gameState = parseTextGame(String(reader.result || ""), file.name);
                        StorageManager.saveGame(gameState);
                        showGame(gameState);
                        const questionCount = gameState.roulettes.reduce((total, roulette) => total + roulette.questions.length, 0);
                        alert(`TXT importado: ${questionCount} preguntas cargadas en ${gameState.roulettes.length} ruletas.`);
                    } catch (error) {
                        alert(`No se pudo importar el TXT: ${error.message}`);
                    }
                };
                reader.onerror = () => alert("No se pudo leer el archivo TXT.");
                reader.readAsText(file, "UTF-8");
                return;
            }

            StorageManager.importFromFile(file, (success, gameState) => {
                if (success) {
                    showGame(gameState);
                    alert("¡Juego importado y cargado con éxito!");
                }
            });
        }
    });

    document.getElementById("btn-back-to-menu").addEventListener("click", () => {
        switchView("main");
    });

    const countInput = document.getElementById("input-roulette-count");
    countInput.addEventListener("input", () => {
        generateRouletteConfigFields(parseInt(countInput.value) || 1);
    });

    function setupDefaultConfigForm() {
        document.getElementById("input-game-name").value = "Concurso General";
        countInput.value = 1;
        generateRouletteConfigFields(1);
    }

    function generateRouletteConfigFields(count) {
        const container = document.getElementById("roulettes-config-container");
        container.innerHTML = "";

        for (let i = 0; i < count; i++) {
            const item = document.createElement("div");
            item.className = "roulette-config-item";
            const questionFields = ALPHABET.map(letter => `
                <div class="question-entry" data-letter="${letter}">
                    <span class="question-entry-letter">${letter}</span>
                    <div class="question-entry-fields">
                        <div class="form-group">
                            <label for="question-${i}-${letter}">Pregunta</label>
                            <textarea id="question-${i}-${letter}" class="question-input" rows="2" placeholder="Escribe la pregunta..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="answer-${i}-${letter}">Respuesta</label>
                            <input id="answer-${i}-${letter}" class="answer-input" type="text" placeholder="Escribe la respuesta...">
                        </div>
                    </div>
                </div>
            `).join("");

            item.innerHTML = `
                <h4>Ruleta ${i + 1}</h4>
                <div class="form-group">
                    <label>Nombre de la Ruleta:</label>
                    <input type="text" class="roulette-name-input" value="Equipo ${i + 1}">
                </div>
                <div class="form-group">
                    <label>Preguntas por letra:</label>
                    <div class="question-entry-list">${questionFields}</div>
                </div>
            `;
            container.appendChild(item);
        }
    }

    document.getElementById("btn-start-game").addEventListener("click", () => {
        const gameName = document.getElementById("input-game-name").value || "Pasapalabras";
        const rouletteItems = document.querySelectorAll(".roulette-config-item");
        const roulettes = [];

        for (const [index, item] of rouletteItems.entries()) {
            const name = item.querySelector(".roulette-name-input").value || `Ruleta ${index + 1}`;
            const entries = [...item.querySelectorAll(".question-entry")].map(entry => ({
                letra: entry.dataset.letter,
                pregunta: entry.querySelector(".question-input").value.trim(),
                respuesta: entry.querySelector(".answer-input").value.trim()
            }));
            const hasAnyQuestion = entries.some(entry => entry.pregunta || entry.respuesta);

            if (hasAnyQuestion) {
                const incompleteEntry = entries.find(entry => Boolean(entry.pregunta) !== Boolean(entry.respuesta));
                if (incompleteEntry) {
                    alert(`Completa la pregunta y la respuesta de la letra ${incompleteEntry.letra} en la Ruleta ${index + 1}.`);
                    return;
                }
            }

            let questions = entries.filter(entry => entry.pregunta && entry.respuesta);
            if (!hasAnyQuestion) {
                questions = ALPHABET.map(letter => ({
                    letra: letter,
                    pregunta: `Empieza por ${letter}: Pregunta de prueba o definición correspondiente.`,
                    respuesta: `Respuesta ${letter}`,
                    status: "pending"
                }));
            }

            questions = questions.map(q => ({ ...q, status: q.status || "pending" }));
            roulettes.push({ name, questions });
        }

        const newGameState = { name: gameName, roulettes };
        StorageManager.saveGame(newGameState);
        gameManager.initGame(newGameState);

        document.getElementById("display-game-name").textContent = gameName;
        switchView("game");
        gameManager.renderTabs();
        gameManager.renderWheel();
    });

    document.getElementById("btn-game-menu").addEventListener("click", () => {
        if (confirm("¿Volver al menú principal? El progreso actual ya se encuentra guardado.")) {
            switchView("main");
        }
    });

    document.getElementById("btn-reset-roulette").addEventListener("click", () => {
        gameManager.resetCurrentRoulette();
    });

    document.getElementById("btn-show-answer").addEventListener("click", () => {
        document.getElementById("answer-container").classList.remove("hidden");
    });

    document.getElementById("btn-mark-correct").addEventListener("click", () => {
        gameManager.markState("correct");
    });

    document.getElementById("btn-mark-pass").addEventListener("click", () => {
        gameManager.markState("pass");
    });

    document.querySelectorAll("[data-wildcard]").forEach(button => {
        button.addEventListener("click", () => gameManager.useWildcard(button.dataset.wildcard));
    });

    document.getElementById("btn-bible-pause").addEventListener("click", () => {
        gameManager.toggleBibleTimer();
    });

    document.getElementById("btn-bible-end").addEventListener("click", () => {
        gameManager.endBibleTimer();
    });
});