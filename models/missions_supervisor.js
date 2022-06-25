import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const Missions_supervisor = sequelize.define('missions_supervisors', {
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

export default Missions_supervisor;