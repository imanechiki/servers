import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import schema from './schema.js';
import authenticateToken from './middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.GRAPHQL_API_PORT || 4000;

app.use(async (req, res, next) => {
  try {
    const user = await authenticateToken(req);
    req.context = { user };
  } catch (error) {
    req.context = {}; 
  }
  next();
});

app.use(
  '/graphql',
  graphqlHTTP((req) => ({
    schema,
    context: req.context,
    graphiql: true,
  }))
);

app.listen(PORT, () => {
  console.log(`GraphQL API server running on http://localhost:${PORT}/graphql`);
});
