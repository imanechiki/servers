import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';

const authenticateToken = async (req) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    console.log('No token provided');
    throw new Error('Authorization token required');
  }

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/validate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const contentType = response.headers.get('content-type');
    const responseBody = await response.text();

    console.log('Auth Service Response:', responseBody); // Log the raw response
    console.log('Content Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Received non-JSON response from Auth Service');
    }

    const data = JSON.parse(responseBody);

    if (!data.valid) throw new Error('Invalid token');
    
    // Attach both user data and token to the context
    return { ...data.user, token }; 
  } catch (error) {
    console.error('Error in authenticateToken:', error.message);
    throw new Error('Authentication service unavailable');
  }
};

export default authenticateToken;
