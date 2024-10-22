const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');  
const app = express();

app.use(express.json());

const secretKey = 'your_secret_key';  


app.get('/', (req, res) => {
  res.send('Welcome to the Finance API! Use /transactions, /summary, or /report to interact with the API.');
});


app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  });
});


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}


app.post('/transactions', authenticateToken, (req, res) => {
  const { type, category_id, amount, date, description } = req.body;
  
  if (!type || !category_id || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO transactions (type, category_id, amount, date, description, user_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [type, category_id, amount, date, description || '', req.user.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});


app.get('/transactions', authenticateToken, (req, res) => {
  const { page = 1, limit = 10 } = req.query;  
  const offset = (page - 1) * limit;

  db.all(
    `SELECT * FROM transactions WHERE user_id = ? LIMIT ? OFFSET ?`,
    [req.user.userId, parseInt(limit), parseInt(offset)],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(rows);
    }
  );
});


app.get('/transactions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT * FROM transactions WHERE id = ? AND user_id = ?`,
    [id, req.user.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Transaction not found' });
      res.status(200).json(row);
    }
  );
});


app.put('/transactions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { type, category_id, amount, date, description } = req.body;
  
  db.run(
    `UPDATE transactions SET type = ?, category_id = ?, amount = ?, date = ?, description = ? WHERE id = ? AND user_id = ?`,
    [type, category_id, amount, date, description, id, req.user.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
      res.status(200).json({ updated: this.changes });
    }
  );
});


app.delete('/transactions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run(
    `DELETE FROM transactions WHERE id = ? AND user_id = ?`,
    [id, req.user.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
      res.status(204).send();
    }
  );
});


app.get('/summary', authenticateToken, (req, res) => {
  const { category_id, startDate, endDate } = req.query;
  let query = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS balance
    FROM transactions
    WHERE user_id = ?
  `;
  
  const params = [req.user.userId];
  const conditions = [];

  if (category_id) {
    conditions.push(`category_id = ?`);
    params.push(category_id);
  }
  if (startDate && endDate) {
    conditions.push(`date BETWEEN ? AND ?`);
    params.push(startDate, endDate);
  }

  if (conditions.length > 0) {
    query += ` AND ` + conditions.join(' AND ');
  }

  db.get(query, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(row);
  });
});


app.get('/report', authenticateToken, (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(400).json({ error: 'Year and month are required' });
  }

  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`; 

  const query = `
    SELECT categories.name AS category, SUM(transactions.amount) AS total_spent
    FROM transactions
    JOIN categories ON transactions.category_id = categories.id
    WHERE transactions.type = 'expense'
      AND transactions.date BETWEEN ? AND ?
      AND transactions.user_id = ?
    GROUP BY transactions.category_id
  `;

  db.all(query, [startDate, endDate, req.user.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(rows);
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
