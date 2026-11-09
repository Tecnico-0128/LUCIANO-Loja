
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venda = sequelize.define('Venda', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    preco: {
        type: DataTypes.FLOAT,
        allowNull: false
    },

    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },

    data: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

}, {
    tableName: 'vendas',
    timestamps: false
});

module.exports = Venda;
