
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

const sequelize = require('./config/database');
const { Cliente, Produto, Venda } = require('./models');


app.get('/health', (req, res) => {
    res.json({message: 'Servidor funcionando', success: true})
});

app.use(express.json());
app.use(cors());

// Disponibiliza os arquivos do frontend
app.use(express.static('public'));

// =================================
// CLIENTES
// =================================

app.post('/api/cliente', async (req, res) => {
    try {
        const { nome, cpf } = req.body;

        if (!nome || !cpf) {
            return res.status(400).json({
                erro: 'Nome e CPF são obrigatórios.'
            });
        }

        const clienteExistente = await Cliente.findOne({
            where: { cpf }
        });

        if (clienteExistente) {
            return res.status(400).json({
                erro: 'Já existe um cliente cadastrado com este CPF.'
            });
        }

        const novoCliente = await Cliente.create({
            nome,
            cpf
        });

        return res.status(201).json({
            mensagem: 'Cliente cadastrado com sucesso!',
            cliente: novoCliente
        });

    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
});

app.get('/api/cliente', async (req, res) => {
    try {
        const clientes = await Cliente.findAll();

        return res.json(clientes);

    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
});

app.put('/api/cliente/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
        const { nome } = req.body;

        if (!nome) {
            return res.status(400).json({
                erro: 'O novo nome é obrigatório para a atualização.'
            });
        }

        const cliente = await Cliente.findOne({
            where: { cpf }
        });

        if (!cliente) {
            return res.status(404).json({
                erro: 'Cliente não encontrado.'
            });
        }

        await cliente.update({ nome });

        return res.json({
            mensagem: 'Cliente atualizado com sucesso!',
            cliente
        });

    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
});

app.delete('/api/cliente/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;

        const cliente = await Cliente.findOne({
            where: { cpf }
        });

        if (!cliente) {
            return res.status(404).json({
                erro: 'Cliente não encontrado.'
            });
        }

        await cliente.destroy();

        return res.json({
            mensagem: 'Cliente deletado com sucesso!',
            cliente
        });

    } catch (erro) {
        return res.status(500).json({
            erro: 'Não foi possível excluir o cliente. Verifique se existem vendas vinculadas a ele.'
        });
    }
});

// =================================
// PRODUTOS
// =================================

app.post('/api/produto', async (req, res) => {
    try {
        const { produto, quantidade, preco } = req.body;

        if (!produto || !quantidade || !preco) {
            return res.status(400).json({
                erro: 'Produto, quantidade e preço são obrigatórios.'
            });
        }

        if (
            isNaN(Number(quantidade)) ||
            isNaN(Number(preco)) ||
            Number(quantidade) <= 0 ||
            Number(preco) <= 0
        ) {
            return res.status(400).json({
                erro: 'Informe uma quantidade e um preço válidos.'
            });
        }

        const produtos = await Produto.findAll();

        const produtoExistente = produtos.find(
            p => p.produto.toLowerCase() === produto.trim().toLowerCase()
        );

        if (produtoExistente) {
            return res.status(400).json({
                erro: 'Já existe um produto cadastrado com este nome.'
            });
        }

        const novoProduto = await Produto.create({
            produto: produto.trim(),
            quantidade: Number(quantidade),
            preco: Number(preco)
        });

        return res.status(201).json({
            mensagem: 'Produto cadastrado com sucesso!',
            produto: novoProduto
        });

    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
});

app.get('/api/produto', async (req, res) => {
    try {
        const produtos = await Produto.findAll();

        return res.json(produtos);

    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
});

// Compra de produtos: aumenta o estoque
app.put('/api/produto/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantidade } = req.body;

        if (
            !quantidade ||
            isNaN(Number(quantidade)) ||
            Number(quantidade) <= 0
        ) {
            return res.status(400).json({
                erro: 'Informe uma quantidade válida!'
            });
        }

        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({
                erro: 'Produto não encontrado!'
            });
        }

        await produto.increment('quantidade', {
            by: Number(quantidade)
        });

        await produto.reload();

        return res.json({
            mensagem: 'Compra realizada com sucesso!',
            produto
        });

    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
});

// =================================
// VENDAS
// =================================

app.post('/api/venda', async (req, res) => {
    const transacao = await sequelize.transaction();

    try {
        const { cpf, idProduto, quantidade } = req.body;

        if (!cpf || !idProduto || !quantidade) {
            await transacao.rollback();

            return res.status(400).json({
                erro: 'Cliente, produto e quantidade são obrigatórios.'
            });
        }

        if (
            isNaN(Number(quantidade)) ||
            Number(quantidade) <= 0
        ) {
            await transacao.rollback();

            return res.status(400).json({
                erro: 'Informe uma quantidade válida.'
            });
        }

        const cliente = await Cliente.findOne({
            where: { cpf },
            transaction: transacao
        });

        if (!cliente) {
            await transacao.rollback();

            return res.status(404).json({
                erro: 'Cliente não encontrado!'
            });
        }

        const produto = await Produto.findByPk(idProduto, {
            transaction: transacao
        });

        if (!produto) {
            await transacao.rollback();

            return res.status(404).json({
                erro: 'Produto não encontrado!'
            });
        }

        if (produto.quantidade < Number(quantidade)) {
            await transacao.rollback();

            return res.status(400).json({
                erro: 'Estoque insuficiente!'
            });
        }

        const preco = Number(produto.preco);
        const total = preco * Number(quantidade);

        // Registra a venda
        const novaVenda = await Venda.create({
            clienteId: cliente.id,
            produtoId: produto.id,
            quantidade: Number(quantidade),
            preco,
            total
        }, {
            transaction: transacao
        });

        // Retira os produtos do estoque
        await produto.decrement('quantidade', {
            by: Number(quantidade),
            transaction: transacao
        });

        // Confirma as operações no banco
        await transacao.commit();

        return res.status(201).json({
            mensagem: 'Venda cadastrada com sucesso!',
            venda: novaVenda
        });

    } catch (erro) {
        if (!transacao.finished) {
            await transacao.rollback();
        }

        return res.status(500).json({
            erro: erro.message
        });
    }
});

app.get('/api/venda', async (req, res) => {
    try {
        const vendas = await Venda.findAll({
            include: [
                {
                    model: Cliente,
                    attributes: ['nome', 'cpf']
                },
                {
                    model: Produto,
                    attributes: ['produto', 'preco']
                }
            ]
        });

        return res.json(vendas);

    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
});

// =================================
// INICIAR SERVIDOR
// =================================

async function iniciarServidor() {
    try {
        await sequelize.authenticate();

        console.log('Conexão com SQLite realizada com sucesso!');

        await sequelize.sync();

        console.log('Models sincronizados com o banco de dados!');

        app.listen(PORT, () => {
            console.log(
                `Servidor rodando na porta ${PORT} (http://localhost:${PORT})`
            );
        });

    } catch (erro) {
        console.error('Erro ao iniciar o servidor:', erro);
    }
}

iniciarServidor();