const nome = document.getElementById("nome");
const cpf = document.getElementById("cpf");

const clientes = JSON.parse(localStorage.getItem("clientes")) || [];


async function cadastrar_cliente() {

    if (nome.value.trim() && cpf.value.trim()) {

        if (cpf.value.length == 11) {

            let cliente = {
                nome: nome.value,
                cpf: cpf.value
            };

            const resposta = await fetch('http://localhost:3000/api/cliente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente)
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.erro);
                return;
            }

            alert("O cliente " + dados.cliente.nome + " foi cadastrado com sucesso!");

            buscar_cliente();

        } else {
            alert("O CPF tem que possuir 11 digitos!");
        }

    } else {
        alert("Preencha todos os campos!");
    }
}


async function editar_cliente() {
    if (nome.value.trim() && cpf.value.trim()) {
        if (cpf.value.length == 11) {
            const c = await clientes.find(item => item.cpf === cpf.value);
            if (c) {
                let cliente_atualizado = {
                    nome: nome.value ?? c.nome,
                    cpf: cpf.value ?? c.cpf
                }
                let resposta = await fetch(`http://localhost:3000/api/cliente/${c.cpf}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cliente_atualizado)
                });
                alert("Cliente editado com sucesso!")
                buscar_cliente();
            } else {
                alert("O cliente não foi encontrado!")
            }
        } else {
            alert("O CPF tem que possuir 11 digitos!");
        }
    } else {
        alert("Preencha todos os campos!");
    }
}

async function deletar_cliente() {
    const c = await clientes.find(item => item.cpf === cpf.value);
    if (c) {
        let resposta = await fetch(`http://localhost:3000/api/cliente/${c.cpf}`, {
            method: "DELETE",
        });
        alert("O cliente " + c.nome + " foi removido com sucesso!");
        buscar_cliente();
    } else {
        alert("O cliente não foi encontrado!");
    }
}

async function buscar_cliente() {
    const busca = await fetch("http://localhost:3000/api/cliente");
    const dados = await busca.json();

    clientes.length = 0;
    clientes.push(...dados);

    localStorage.setItem("clientes", JSON.stringify(clientes));

    listar_cliente();
}

function listar_cliente() {
    div_cli.innerHTML = "<h2>Clientes Cadastrados</h2>"
    for (let cliente of clientes)
        div_cli.innerHTML += `<p>Nome:${cliente.nome}</p>`
}
buscar_cliente();



const nomeProduto = document.getElementById("produto");
const quantidade = document.getElementById("quantidade");
const preco = document.getElementById("preco");

const produtos = JSON.parse(localStorage.getItem("produtos")) || [];


async function cadastrar_produto() {

    if (nomeProduto.value.trim() && quantidade.value.trim() && preco.value.trim()) {

        if (!isNaN(Number(quantidade.value)) && !isNaN(Number(preco.value))) {

            if (quantidade.value > 0 && preco.value > 0) {

                let produto = {
                    produto: nomeProduto.value,
                    quantidade: Number(quantidade.value),
                    preco: Number(preco.value)
                };

                const resposta = await fetch('http://localhost:3000/api/produto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(produto)
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    alert(dados.erro);
                    return;
                }

                alert("O produto " + dados.produto.produto + " foi cadastrado com sucesso!");

                buscar_produto();

            } else {
                alert("Informe uma quantidade e um preço maiores que 0!");
            }

        } else {
            alert("Os campos de quantidade e preço devem possuir apenas números!");
        }

    } else {
        alert("Preencha todos os campos para cadastrar o produto!");
    }
}

async function buscar_produto() {
    const busca = await fetch("http://localhost:3000/api/produto");
    const dados = await busca.json();

    produtos.length = 0;
    produtos.push(...dados);

    localStorage.setItem("produtos", JSON.stringify(produtos));

    listar_produtos();
}

async function comprar_produto() {

    const p = produtos.find(item => item.produto === nomeProduto.value);

    if (!p) {
        alert("Produto não encontrado!");
        return;
    }

    if (
        !quantidade.value.trim() ||
        isNaN(Number(quantidade.value)) ||
        Number(quantidade.value) <= 0
    ) {
        alert("Informe uma quantidade válida!");
        return;
    }

    const resposta = await fetch(`http://localhost:3000/api/produto/${p.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            quantidade: Number(quantidade.value)
        })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro);
        return;
    }

    alert("Compra realizada com sucesso!");

    buscar_produto();
}

function listar_produtos() {
    div_cli.innerHTML = "<h2>Produtos Cadastrados</h2>"
    for (let produto of produtos)
        div_cli.innerHTML += `<p>Nome:${produto.produto}</p>`
}
buscar_produto();



const clienteVenda = document.getElementById("clienteVenda");
const produtoVenda = document.getElementById("produtoVenda");
const quantidadeVenda = document.getElementById("quantidadeVenda");

const vendas = JSON.parse(localStorage.getItem("vendas")) || [];



async function cadastrar_venda() {
    const cpf = document.getElementById('clienteVenda').value;
    const idProduto = document.getElementById('produtoVenda').value;
    const quantidade = Number(document.getElementById('quantidadeVenda').value);

    if (!cpf || !idProduto || quantidade <= 0) {
        alert('Preencha todos os campos corretamente!');
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/api/venda', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cpf: cpf,
                idProduto: Number(idProduto),
                quantidade: quantidade
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.mensagem || resultado.erro || 'Erro ao realizar venda!');
            return;
        }

        alert('Venda realizada com sucesso!');

        await carregar_selecoes();

    } catch (erro) {
        console.error('Erro ao realizar venda:', erro);
    }
}


async function buscar_vendas() {

    const resposta = await fetch("http://localhost:3000/api/venda");

    const dados = await resposta.json();

    vendas.length = 0;
    vendas.push(...dados);

    localStorage.setItem("vendas", JSON.stringify(vendas));

    console.log("Vendas cadastradas:", vendas);
}

buscar_vendas();

async function carregar_selecoes() {
    try {
        const respostaClientes = await fetch('http://localhost:3000/api/cliente');
        const clientes = await respostaClientes.json();

        const respostaProdutos = await fetch('http://localhost:3000/api/produto');
        const produtos = await respostaProdutos.json();

        const selectCliente = document.getElementById('clienteVenda');
        const selectProduto = document.getElementById('produtoVenda');

        selectCliente.innerHTML = '<option value="">Selecione um cliente</option>';
        selectProduto.innerHTML = '<option value="">Selecione um produto</option>';

        clientes.forEach(cliente => {
            const opcao = document.createElement('option');

            opcao.value = cliente.cpf;
            opcao.textContent = cliente.nome;

            selectCliente.appendChild(opcao);
        });

        produtos.forEach(produto => {
            const opcao = document.createElement('option');

            opcao.value = produto.id;
            opcao.textContent = produto.produto;

            selectProduto.appendChild(opcao);
        });

    } catch (erro) {
        console.error('Erro ao carregar os selects:', erro);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregar_selecoes();
});

async function relatorio_clientes() {
    try {
        const resposta = await fetch('http://localhost:3000/api/cliente');
        const clientes = await resposta.json();

        const colunas = ['ID', 'Nome', 'CPF'];

        const dados = clientes.map(cliente => [
            cliente.id,
            cliente.nome,
            cliente.cpf
        ]);

        mostrar_relatorio('Relatório de Clientes', colunas, dados);

    } catch (erro) {
        console.error('Erro ao buscar clientes:', erro);
    }
}

async function relatorio_produtos() {
    try {
        const resposta = await fetch('http://localhost:3000/api/produto');
        const produtos = await resposta.json();

        const colunas = ['ID', 'Produto', 'Quantidade', 'Preço'];

        const dados = produtos.map(produto => [
            produto.id,
            produto.produto,
            produto.quantidade,
            Number(produto.preco).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })
        ]);

        mostrar_relatorio('Relatório de Produtos', colunas, dados);

    } catch (erro) {
        console.error('Erro ao buscar produtos:', erro);
    }
}

async function relatorio_vendas() {
    try {
        const resposta = await fetch('http://localhost:3000/api/venda');
        const vendas = await resposta.json();

        const colunas = [
            'ID',
            'Cliente',
            'Produto',
            'Quantidade',
            'Total',
            'Data'
        ];

        const dados = vendas.map(venda => [
            venda.id,
            venda.Cliente?.nome || 'Não encontrado',
            venda.Produto?.produto || 'Não encontrado',
            venda.quantidade,
            Number(venda.total).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }),
            venda.data ? new Date(venda.data).toLocaleDateString('pt-BR') : '-'
        ]);

        mostrar_relatorio('Relatório de Vendas', colunas, dados);

    } catch (erro) {
        console.error('Erro ao buscar vendas:', erro);
    }
}


function mostrar_relatorio(titulo, colunas, dados) {
    const resultado = document.getElementById('resultadoRelatorio');

    resultado.innerHTML = ''; //Caso tenha um relatorio anterior ele vai limpar

    const h3 = document.createElement('h3'); //Cria o titulo que fica encima da tabela de relatorio
    h3.textContent = titulo;
    resultado.appendChild(h3);

    if (dados.length === 0) {
        //Verifica se vai ter algum registro para fazer o relatorio
        resultado.appendChild(document.createTextNode('Nenhum registro encontrado.'));
        return;
    }

    // Cria a tabela
    const tabela = document.createElement('table');
    const cabecalho = document.createElement('thead');
    const linhaCabecalho = document.createElement('tr');

    colunas.forEach(coluna => {
        // Adiciona os nomes das colunas depois de ter criado elas ali encima
        const th = document.createElement('th');
        th.textContent = coluna;
        linhaCabecalho.appendChild(th);
    });

    cabecalho.appendChild(linhaCabecalho);
    tabela.appendChild(cabecalho);

    // Cria o corpo para receber os dados da tabela
    const corpo = document.createElement('tbody');

    dados.forEach(linha => {
        //Cria as linhas da tabela com base no número de dados no forEach
        const tr = document.createElement('tr');

        linha.forEach(valor => {
            //Se ele criou a linha ali encima significa que ele tem mais dados para adicionar então ele adiciona o tr e td com os dados
            const td = document.createElement('td');
            td.textContent = valor ?? '-';
            tr.appendChild(td);
        });

        corpo.appendChild(tr);
    });

    tabela.appendChild(corpo);
    resultado.appendChild(tabela);
}