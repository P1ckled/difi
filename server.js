// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Разрешаем CORS и JSON
app.use(cors());
app.use(express.json());

// Подключаем базу (файл seats.db создастся сам)
const dbPath = path.join(__dirname, 'seats.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err.message);
  } else {
    console.log('Подключено к SQLite:', dbPath);
  }
});

// Инициализация таблицы мест
const ROWS = 6;
const COLS = 8;

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS seats (
      id TEXT PRIMARY KEY,
      row INTEGER NOT NULL,
      col INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'free'
    )
  `, (err) => {
    if (err) {
      console.error('Ошибка создания таблицы seats:', err.message);
      return;
    }

    // Заполняем таблицу, если она пустая
    db.get('SELECT COUNT(*) AS count FROM seats', (err, row) => {
      if (err) {
        console.error('Ошибка проверки seats:', err.message);
        return;
      }

      if (row.count === 0) {
        const stmt = db.prepare('INSERT INTO seats (id, row, col, status) VALUES (?, ?, ?, ?)');
        for (
