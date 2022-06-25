import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const Users_to_create = sequelize.define('users_to_creates', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   email: {
      type: Sequelize.STRING,
      allowNull:false,
      unique:true
   }
});

export default Users_to_create;