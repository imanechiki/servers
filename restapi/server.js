import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './db.js';
import authenticateToken from './middleware/authMiddleware.js';
import User from './models/User.js';
import Item from './models/Items.js';

dotenv.config();
const app = express();
app.use(express.json());

const { REST_API_PORT } = process.env;



app.get('/api/items', authenticateToken, async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/items', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const item = await Item.create({ name });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/items/:id', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const item = await Item.findByPk(req.params.id);
    if (item) {
      item.name = name;
      await item.save();
      res.json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (item) {
      await item.destroy();
      res.json({ message: 'Item deleted' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = REST_API_PORT || 3000;
app.listen(PORT, async () => {
  await sequelize.sync();
  console.log(`REST API running on http://localhost:${PORT}`);
});
