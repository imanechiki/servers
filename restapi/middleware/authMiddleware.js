import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';

const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/validate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (data.valid) {
      req.user = data.user;
      next();
    } else {
      return res.status(403).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
};

export default authenticateToken;
