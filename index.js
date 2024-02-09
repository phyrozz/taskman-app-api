const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const fs = require("fs");
const cors = require('cors');

const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connection configuration for the db
// the mysql db is hosted on Aiven
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./ca.pem").toString(),
  }
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connection established.');
});

// to avoid missing cors error on the console
app.use(cors());

// fetch tasks data
app.get('/tasks', (req, res) => {
  const query = 'SELECT * FROM tasks';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send('Error fetching tasks');
    } else {
      res.status(200).json(result);
    }
  });
});

// add a new task
app.post('/tasks', (req, res) => {
  const { title, status } = req.body;
  const query = 'INSERT INTO tasks (title, status) VALUES (?, ?)';
  db.query(query, [title, status], (err, result) => {
    if (err) {
      throw err;
    }
    res.status(201).send('Task added successfully');
  });
});

// update task status
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;
  const query = 'UPDATE tasks SET status = ? WHERE id = ?';
  db.query(query, [status, taskId], (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send('Task status updated successfully');
  });
});

// delete a task
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const query = 'DELETE FROM tasks WHERE id = ?';
  db.query(query, [taskId], (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send('Task deleted successfully');
  });
});

app.listen(5000, () => {
  console.log(`Server running on port 5000`);
});
