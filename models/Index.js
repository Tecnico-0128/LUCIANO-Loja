
const Cliente = require('./Cliente');
const Produto = require('./Produto');
const Venda = require('./Vendas');

Cliente.hasMany(Venda, {
    foreignKey: 'clienteId'
});

Venda.belongsTo(Cliente, {
    foreignKey: 'clienteId'
});

Produto.hasMany(Venda, {
    foreignKey: 'produtoId'
});

Venda.belongsTo(Produto, {
    foreignKey: 'produtoId'
});

module.exports = {
    Cliente,
    Produto,
    Venda
};
