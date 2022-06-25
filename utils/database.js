import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('QrScanner', 'root', 'RootooR', {
    dialect: 'mysql',
    host: 'localhost', 
});

export default sequelize;