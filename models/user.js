import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const User = sequelize.define('users', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   email: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   phone: {
      type: Sequelize.STRING,
      allowNull: true,
   },
   password: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   isAdmin: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    },
    isDeactivated: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
   },
    firstname: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});

export default User;