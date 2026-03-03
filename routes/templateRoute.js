const express = require('express');
const app = express();

app.use(express.json()); // for parsing JSON bodies

// GET route
app.get('/', (req, res) => {
  res.send('Home Route');
});

// GET with params
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ message: `User ID is ${userId}` });
});

// POST route
app.post('/users', (req, res) => {
  const data = req.body;
  res.status(201).json({
    message: 'User created',
    data: data
  });
});

// PUT route
app.put('/users/:id', (req, res) => {
  res.json({ message: `User ${req.params.id} updated` });
});

// DELETE route
app.delete('/users/:id', (req, res) => {
  res.json({ message: `User ${req.params.id} deleted` });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});