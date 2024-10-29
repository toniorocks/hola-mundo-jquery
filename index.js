const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { error } = require('console');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3005;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)');
});

app.get('/', (request, response) => {

    response.sendFile(path.join(__dirname, 'public', 'index.html'));

});

app.post('/login', (request, response) => {
    const { nombre, email } = request.body;
    const sentence = db.prepare('SELECT * FROM users WHERE email = ? AND name = ?');
    sentence.get([email, nombre], (err, row) => {
        if (err) {
            return response.status(400).json({ error: err.message });
        }
        if (!row) {
            return response.status(404).json({ error: 'Usuario no encontrado' });
        }
        response.status(200).json({ user: row });
    });
});

app.get('/users', (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            res.json({ success: false });
        }
        res.json(rows);
    });
});

app.post('/user', (req, res) => {
    const { nombre, email } = req.body;
    const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
    stmt.run(nombre, email, function(err, data) {
        if (err) {
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
        console.log('data ----->', data);
    });
    stmt.finalize();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});