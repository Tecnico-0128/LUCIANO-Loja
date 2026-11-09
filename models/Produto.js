
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produto = sequelize.define('Produto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    produto: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    preco: {
        type: DataTypes.FLOAT,
        allowNull: false
    }

}, {
    tableName: 'produtos',
    timestamps: false
});

module.exports = Produto;
