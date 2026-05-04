/**
 * BACKEND BÁSICO (API) - Loja Pink Versão 3.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path'); // 👉 ADICIONADO

const app = express();

// Permite que o Front-end converse com este servidor sem bloqueios
app.use(cors());
app.use(express.json());

// 👉 SERVIR O FRONT-END JUNTO COM O BACKEND
app.use(express.static(path.join(__dirname, '../front')));

// ==========================================
// 1. "BANCO DE DADOS" (Em memória para testes)
// ==========================================
const BancoDeDados = {
    produtos: [
        { id: 1, nome: "Vestido Midi Floral", preco: 189.90, imagem: "🌸", estoque: 15 },
        { id: 2, nome: "Blusa Tricot Manga", preco: 129.90, imagem: "👚", estoque: 8 },
        { id: 3, nome: "Calça Pantalona", preco: 219.90, imagem: "👖", estoque: 5 }
    ],
    pedidos: []
};

// ==========================================
// 2. ROTAS DA API
// ==========================================

app.get('/api/produtos', (req, res) => {
    res.json(BancoDeDados.produtos);
});

app.post('/api/checkout', (req, res) => {
    const { carrinhoFront, cupom, usuario } = req.body;
    let total = 0;

    carrinhoFront.forEach(item => {
        const produto = BancoDeDados.produtos.find(p => p.id === item.id);
        if (produto && produto.estoque >= item.quantidade) {
            total += produto.preco * item.quantidade;
            produto.estoque -= item.quantidade;
        }
    });

    let desconto = cupom === 'PINK10' ? 10 : 0;
    const valorFinal = Math.max(0, total - desconto);

    const pedido = {
        id: "PINK-" + Math.floor(Math.random() * 10000),
        cliente: usuario.nome,
        email: usuario.email,
        endereco: usuario.endereco,
        valor: valorFinal,
        status: "Pagamento Aprovado",
        data: new Date().toISOString()
    };

    BancoDeDados.pedidos.push(pedido);

    res.json({
        sucesso: true,
        recibo: pedido
    });
});

// ==========================================
// 3. INICIAR SERVIDOR
// ==========================================

const PORTA = 3000;

app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});