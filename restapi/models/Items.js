import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Item = sequelize.define('Item', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Item;
