import dotenv from 'dotenv';
dotenv.config();

export const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://172.20.117.85:5000';
export const GRAPHQL_API_PORT = process.env.GRAPHQL_API_PORT || 4000;
export const REST_API_BASE_URL = process.env.REST_API_BASE_URL || 'http://172.20.117.85:3000';
