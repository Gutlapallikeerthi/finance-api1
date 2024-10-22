const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');  

db.serialize(() => {
  
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `);

  
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL
    );
  `);

  
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category_id INTEGER,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      user_id INTEGER NOT NULL,
      FOREIGN KEY(category_id) REFERENCES categories(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  
  
  db.run("INSERT INTO categories (name, type) VALUES ('Salary', 'income')");
  db.run("INSERT INTO categories (name, type) VALUES ('Food', 'expense')");
  db.run("INSERT INTO categories (name, type) VALUES ('Entertainment', 'expense')");
});

module.exports = db;
