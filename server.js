/**
 * BACKEND BÁSICO (API) - Loja Pink Versão 3.2 (Produção)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 👉 Corrigido: caminho do front mais seguro
const frontPath = path.join(__dirname, 'front'); // ← ALTERADO AQUI

app.use(express.static(frontPath));

// ==========================================
// 1. "BANCO DE DADOS"
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
// 2. ROTAS
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

    const desconto = cupom === 'PINK10' ? 10 : 0;
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
// 👉 ROTA PADRÃO + FALLBACK (IMPORTANTE)
// ==========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(frontPath, 'index.html'));
});

// 👉 IMPORTANTE: fallback para qualquer rota
app.get('*', (req, res) => {
    res.sendFile(path.join(frontPath, 'index.html'));
});

// ==========================================
// 3. SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
