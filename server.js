const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const HISTORY_FILE = path.join(__dirname, 'chat_history.json');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname));

function loadHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        try {
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }
    return [];
}

function saveHistory(history) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}

app.post('/chat', (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: 'Mensaje vacío' });
    }

    let history = loadHistory();
    history.unshift({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });

    let botReply = `Recibí tu mensaje: "${userMessage}". Memoria persistente guardada con éxito.`;

    history.unshift({ role: 'assistant', content: botReply, timestamp: new Date().toISOString() });

    if (history.length > 100) {
        history = history.slice(0, 100);
    }

    saveHistory(history);
    res.json({ reply: botReply, history: history });
});

app.get('/history', (req, res) => {
    const history = loadHistory();
    res.json(history);
});

app.listen(PORT, () => {
    console.log(`Servidor de la IA corriendo en http://localhost:${PORT}`);
});
