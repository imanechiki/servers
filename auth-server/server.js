import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { sequelize } from './db.js';
import User from './models/User.js';

dotenv.config();
const app = express();
app.use(express.json());

const { JWT_SECRET, JWT_EXPIRATION, AUTH_SERVICE_PORT } = process.env;

app.get('/auth/users', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username'] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) return res.status(400).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/validate', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    res.status(200).json({ valid: true, user });
  });
});

const PORT = AUTH_SERVICE_PORT || 5000;
app.listen(PORT, async () => {
  await sequelize.sync();
  console.log(`Auth Service running on http://localhost:${PORT}`);
});
