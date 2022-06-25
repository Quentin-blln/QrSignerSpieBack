import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const Missions_contributor = sequelize.define('missions_contributors', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   user_id: {
      type: Sequelize.INTEGER,
   },
   mission_id: {
      type: Sequelize.INTEGER,
   },
});

export default Missions_contributor;