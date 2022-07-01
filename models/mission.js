import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const Mission = sequelize.define('missions', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   name: {
      type: Sequelize.STRING,
   },
   description: {
    type: Sequelize.STRING,
    },
    company_name: {
        type: Sequelize.STRING,
    },
    company_location: {
        type: Sequelize.STRING,
    },
    company_contact: {
        type: Sequelize.STRING,
     },
   date: {
      type: Sequelize.DATE,
   },
   isDone: {
    type: Sequelize.BOOLEAN,
    }
});

export default Mission;