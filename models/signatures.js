import { Sequelize } from 'sequelize';

import sequelize from '../utils/database.js';

const Signature = sequelize.define('signatures', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    mission_id: {
        type: Sequelize.INTEGER,
    },
    supervisor_id: {
        type: Sequelize.INTEGER,
    },
    contributor_id: {
        type: Sequelize.INTEGER,
    },
    comment: {
        type: Sequelize.STRING,
    },
});

export default Signature;