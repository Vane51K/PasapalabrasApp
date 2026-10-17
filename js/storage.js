const STORAGE_KEY = "pasapalabras_current_game";

const StorageManager = {
    saveGame(gameState) {
        try {
            const dataString = JSON.stringify(gameState);
            localStorage.setItem(STORAGE_KEY, dataString);
            return true;
        } catch (e) {
            console.error("Error al guardar en almacenamiento local:", e);
            return false;
        }
    },

    loadGame() {
        try {
            const dataString = localStorage.getItem(STORAGE_KEY);
            return dataString ? JSON.parse(dataString) : null;
        } catch (e) {
            console.error("Error al cargar desde almacenamiento local:", e);
            return null;
        }
    },

    importFromFile(file, callback) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const gameState = JSON.parse(event.target.result);
                if (!gameState.roulettes || !Array.isArray(gameState.roulettes)) {
                    throw new Error("El archivo JSON no tiene una estructura válida de Pasapalabras.");
                }
                StorageManager.saveGame(gameState);
                callback(true, gameState);
            } catch (e) {
                console.error("Error al procesar el archivo JSON:", e);
                alert("Error al importar el archivo: Asegúrate de que sea un JSON válido de Pasapalabras.");
                callback(false, null);
            }
        };
        reader.readAsText(file);
    }
};