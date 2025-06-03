const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// SQLite adatbázis
const db = new sqlite3.Database('./blog.db');

// Tábla létrehozása
db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT,
    title TEXT,
    category TEXT,
    content TEXT,
    created_at TEXT,
    updated_at TEXT
)`);

// API: Összes blog lekérdezése
app.get('/posts', (req, res) => {
    db.all('SELECT * FROM posts', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// API: Egy blog hozzáadása
app.post('/posts', (req, res) => {
    const { author, title, category, content } = req.body;
    const now = new Date().toISOString();
    db.run(`INSERT INTO posts (author, title, category, content, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [author, title, category, content, now, now],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// API: Blog szerkesztése
app.put('/posts/:id', (req, res) => {
    const { author, title, category, content } = req.body;
    const now = new Date().toISOString();
    db.run(`UPDATE posts SET author=?, title=?, category=?, content=?, updated_at=?
            WHERE id=?`,
        [author, title, category, content, now, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ changes: this.changes });
        });
});

// API: Blog törlése
app.delete('/posts/:id', (req, res) => {
    db.run(`DELETE FROM posts WHERE id=?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});
