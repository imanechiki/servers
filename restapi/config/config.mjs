export const REST_API_PORT = process.env.REST_API_PORT || 3000;
export const GRAPHQL_API_PORT = process.env.GRAPHQL_API_PORT || 4000;
export const DATABASE_PATH = process.env.DATABASE_PATH || './database.sqlite';
export const REST_API_BASE_URL = `http://172.20.117.85:${REST_API_PORT}/api`;
 
export const JWT_SECRET = "H<Ms8.cs>w,q9QX*Zn4JVm";
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h'
console.log(JWT_EXPIRATION)
