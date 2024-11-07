import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import fetch from 'node-fetch';
import { AUTH_SERVICE_URL, REST_API_BASE_URL } from './config/config.mjs';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLInt },
    username: { type: GraphQLString },
  },
});

const ItemType = new GraphQLObjectType({
  name: 'Item',
  fields: {
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
  },
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    items: {
      type: new GraphQLList(ItemType),
      resolve: async (_, __, context) => {
        if (!context.user) throw new Error('Unauthorized');

        const response = await fetch(`${REST_API_BASE_URL}/api/items`, {
          headers: { Authorization: `Bearer ${context.user.token}` },
        });

        const responseBody = await response.text();
        console.log('REST API Response Body:', responseBody);

        try {
          const data = JSON.parse(responseBody);
          
          if (!Array.isArray(data)) {
            throw new Error('Expected an array of items from REST API');
          }
          
          return data;
        } catch (err) {
          console.error('Failed to parse JSON:', err);
          throw new Error('Received non-JSON response from REST API');
        }
      },
    },

    users: {
      type: new GraphQLList(UserType),
      resolve: async (_, __, context) => {
        if (!context.user) throw new Error('Unauthorized');
    
        const response = await fetch(`${AUTH_SERVICE_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${context.user.token}` },
        });
    
        const responseBody = await response.text();
        console.log('Auth Service Response Body (users):', responseBody);
    
        try {
          const data = JSON.parse(responseBody);
          if (!Array.isArray(data)) throw new Error('Expected an array of users from Auth Service');
          return data;
        } catch (err) {
          console.error('Failed to parse JSON (users):', err);
          throw new Error(`Unexpected response from Auth Service: ${responseBody}`);
        }
      },
    },
    

    me: {
      type: UserType,
      resolve: async (_, __, context) => {
        if (!context.user) throw new Error('Unauthorized');
        return context.user;
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    registerUser: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { username, password }) => {
        const response = await fetch(`${AUTH_SERVICE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        return { id: data.id, username: data.username };
      },
    },

    loginUser: {
      type: GraphQLString, 
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { username, password }) => {
        const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data.token;
      },
    },

    createItem: {
      type: ItemType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { name }, context) => {
        if (!context.user) throw new Error('Unauthorized');

        const response = await fetch(`${REST_API_BASE_URL}/api/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${context.user.token}`,
          },
          body: JSON.stringify({ name }),
        });
        return response.json();
      },
    },

    updateItem: {
      type: ItemType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { id, name }, context) => {
        if (!context.user) throw new Error('Unauthorized');

        const response = await fetch(`${REST_API_BASE_URL}/api/items/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${context.user.token}`,
          },
          body: JSON.stringify({ name }),
        });
        return response.json();
      },
    },

    deleteItem: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (_, { id }, context) => {
        if (!context.user) throw new Error('Unauthorized');

        const response = await fetch(`${REST_API_BASE_URL}/api/items/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${context.user.token}`,
          },
        });
        if (response.ok) return 'Item deleted successfully';
        throw new Error('Failed to delete item');
      },
    },
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
