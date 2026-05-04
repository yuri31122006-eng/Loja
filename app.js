// ==========================================
// ESTADO E USUÁRIO (PERSISTÊNCIA)
// ==========================================
const Estado = {
    carrinho: [],
    usuarioAtual: null,
    init() {
        const salvoCarrinho = localStorage.getItem('lojaPink_carrinho');
        if (salvoCarrinho) this.carrinho = JSON.parse(salvoCarrinho);
        
        const salvoUsuario = sessionStorage.getItem('lojaPink_logado');
        if (salvoUsuario) {
            // Atualiza dados do localStorage para garantir histórico novo
            this.usuarioAtual = JSON.parse(localStorage.getItem('user_' + salvoUsuario.email)) || salvoUsuario;
        }
        
        CarrinhoUI.atualizarContador();
    },
    salvar() {
        localStorage.setItem('lojaPink_carrinho', JSON.stringify(this.carrinho));
        CarrinhoUI.atualizarContador();
    },
    atualizarUsuarioNoBanco() {
        if (this.usuarioAtual) {
            localStorage.setItem('user_' + this.usuarioAtual.email, JSON.stringify(this.usuarioAtual));
            sessionStorage.setItem('lojaPink_logado', JSON.stringify(this.usuarioAtual));
        }
    }
};

// ==========================================
// VITRINE
// ==========================================
const Vitrine = {
    carregar() {
        const produtos = [
            { id: 1, nome: "Vestido Midi Floral", preco: 189.90, imagem: "🌸" },
            { id: 2, nome: "Blusa Tricot Manga", preco: 129.90, imagem: "👚" },
            { id: 3, nome: "Calça Pantalona", preco: 219.90, imagem: "👖" }
        ];
        const container = document.getElementById('lista-produtos');
        if (!container) return;
        container.innerHTML = '';
        produtos.forEach(p => {
            container.innerHTML += `
                <div class="container-seguro" style="padding: 15px;">
                    <div style="font-size: 40px; margin-bottom: 10px;">${p.imagem}</div>
                    <h3 style="font-size: 16px; margin-bottom: 5px;">${p.nome}</h3>
                    <p style="color: #D81B60; font-weight: bold; margin-bottom: 15px;">R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
                    <button class="btn-primario" style="padding: 10px;" onclick="CarrinhoUI.adicionar(${p.id}, '${p.nome}', ${p.preco})">Adicionar</button>
                </div>
            `;
        });
    }
};

// ==========================================
// FLUXO DE AUTENTICAÇÃO E PERFIL
// ==========================================
const Auth = {
    emailTemp: '',
    abrirPainel() {
        if (Estado.usuarioAtual) {
            this.renderizarPerfil();
            Modal.abrir('perfil-sec');
        } else {
            Modal.abrir('login-sec');
        }
    },
    renderizarPerfil() {
        const u = Estado.usuarioAtual;
        document.getElementById('perfil-nome').innerText = u.nome;
        document.getElementById('perfil-email').innerText = u.email;
        
        const lista = document.getElementById('historico-lista');
        if (!u.historico || u.historico.length === 0) {
            lista.innerHTML = '<p style="font-size: 13px; color: #bbb;">Nenhuma compra realizada ainda.</p>';
        } else {
            lista.innerHTML = u.historico.map(p => `
                <div style="padding: 10px; border-bottom: 1px solid #eee; font-size: 12px;">
                    <strong>ID: ${p.id}</strong> - ${p.data}<br>
                    Status: <span style="color: green;">${p.status}</span><br>
                    Total: R$ ${p.total.toFixed(2).replace('.', ',')}
                </div>
            `).join('');
        }
    },
    logout() {
        sessionStorage.removeItem('lojaPink_logado');
        Estado.usuarioAtual = null;
        Modal.fechar('perfil-sec');
        Toast.show("Você saiu da conta.");
    },
    verificarEmail() {
        this.emailTemp = document.getElementById('email-verificacao').value;
        if(!this.emailTemp.includes('@')) return Toast.show("Digite um e-mail válido", "erro");
        document.getElementById('auth-passo-email').style.display = 'none';
        if(localStorage.getItem('user_' + this.emailTemp)) {
            document.getElementById('auth-passo-login').style.display = 'block';
        } else {
            document.getElementById('auth-passo-cadastro').style.display = 'block';
        }
    },
    fazerLogin() {
        const senha = document.getElementById('senha-login').value;
        const dados = JSON.parse(localStorage.getItem('user_' + this.emailTemp));
        if(dados && dados.senha === senha) {
            this.sucessoLogar(dados);
        } else {
            Toast.show("Senha incorreta", "erro");
        }
    },
    fazerCadastro() {
        const nome = document.getElementById('nome-cadastro').value;
        const senha = document.getElementById('senha-cadastro').value;
        if(!nome || !senha) return Toast.show("Preencha tudo!", "erro");
        const dados = { nome, email: this.emailTemp, senha, endereco: null, historico: [] };
        localStorage.setItem('user_' + this.emailTemp, JSON.stringify(dados));
        this.sucessoLogar(dados);
    },
    sucessoLogar(dados) {
        Estado.usuarioAtual = dados;
        sessionStorage.setItem('lojaPink_logado', JSON.stringify(dados));
        Toast.show(`Bem-vinda, ${dados.nome.split(' ')[0]}!`);
        Modal.fechar('login-sec');
        if (sessionStorage.getItem('intencao_checkout')) {
            sessionStorage.removeItem('intencao_checkout');
            setTimeout(() => Pagamento.abrirCarrinho(true), 400);
        }
    },
    resetar() {
        document.getElementById('auth-passo-login').style.display = 'none';
        document.getElementById('auth-passo-cadastro').style.display = 'none';
        document.getElementById('auth-passo-email').style.display = 'block';
    }
};

// ==========================================
// SISTEMA DE VALIDAÇÃO (CPF, CARTÃO, DATAS)
// ==========================================
const Validador = {
    cpf(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        return resto === parseInt(cpf.substring(10, 11));
    },
    cartao(num) {
        num = num.replace(/\D/g, '');
        let soma = 0, b = false;
        for (let i = num.length - 1; i >= 0; i--) {
            let n = parseInt(num[i]);
            if (b) { if ((n *= 2) > 9) n -= 9; }
            soma += n;
            b = !b;
        }
        return (soma % 10) === 0 && num.length >= 13;
    },
    data(data) {
        if (!/^\d{2}\/\d{2}$/.test(data)) return false;
        const [m, a] = data.split('/').map(Number);
        const anoAtualCurto = parseInt(new Date().getFullYear().toString().slice(-2));
        if (m < 1 || m > 12) return false;
        if (a < 30) return false; // Bloqueia anos abaixo de 30 como solicitado
        if (data === "11/11") return false; // Bloqueia sequências repetidas
        return true;
    },
    cvc(cvc) {
        if (cvc.length !== 3) return false;
        if (!!cvc.match(/(\d)\1{2}/)) return false; // Bloqueia 111, 222, etc.
        return true;
    }
};

// ==========================================
// CARRINHO E CHECKOUT
// ==========================================
const CarrinhoUI = {
    adicionar(id, nome, preco) {
        const item = Estado.carrinho.find(i => i.id === id);
        if (item) item.quantidade++;
        else Estado.carrinho.push({ id, nome, preco, quantidade: 1, selecionado: true });
        Estado.salvar();
        Toast.show(`${nome} na sacola!`);
    },
    atualizarContador() {
        const totalItens = Estado.carrinho.reduce((a, b) => a + b.quantidade, 0);
        document.getElementById('contador-carrinho').innerText = totalItens;
    },
    renderizar() {
        const container = document.getElementById('area-itens-carrinho');
        if (Estado.carrinho.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#888; padding: 20px;">Sacola vazia.</p>';
            Checkout.atualizarTotal(); return;
        }
        container.innerHTML = '';
        Estado.carrinho.forEach((item, index) => {
            container.innerHTML += `
                <div class="item-checkout">
                    <input type="checkbox" onchange="CarrinhoUI.alternar(${index})" ${item.selecionado ? 'checked' : ''}>
                    <div class="info-item">
                        ${item.quantidade}x <strong>${item.nome}</strong><br>
                        <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button onclick="CarrinhoUI.remover(${index})" style="background:none; border:none; color:#BDBDBD; font-size:18px; cursor:pointer;">✕</button>
                </div>
            `;
        });
        Checkout.atualizarTotal();
    },
    alternar(index) { Estado.carrinho[index].selecionado = !Estado.carrinho[index].selecionado; Estado.salvar(); Checkout.atualizarTotal(); },
    remover(index) { Estado.carrinho.splice(index, 1); Estado.salvar(); this.renderizar(); }
};

const Pagamento = {
    metodo: 'pix',
    abrirCarrinho(irParaPagamento = false) {
        CarrinhoUI.renderizar();
        Modal.abrir('pagamento-sec');
        if(irParaPagamento) {
            document.getElementById('passo-1-carrinho').style.display = 'none';
            document.getElementById('passo-2-pagamento').style.display = 'block';
            if(Estado.usuarioAtual && Estado.usuarioAtual.endereco) {
                const e = Estado.usuarioAtual.endereco;
                document.getElementById('cep').value = e.cep;
                document.getElementById('detalhes-endereco').style.display = 'block';
                document.getElementById('txt-endereco').innerText = e.rua;
                document.getElementById('num-casa').value = e.numero;
                document.getElementById('tipo-residencia').value = e.tipo;
                document.getElementById('complemento').value = e.complemento || '';
            }
        } else {
            document.getElementById('passo-1-carrinho').style.display = 'block';
            document.getElementById('passo-2-pagamento').style.display = 'none';
        }
    },
    selecionarMetodo(m) {
        this.metodo = m;
        document.querySelectorAll('.btn-metodo').forEach(b => b.classList.remove('selecionado'));
        document.getElementById('btn-' + m).classList.add('selecionado');
        document.getElementById('ui-pix').style.display = m === 'pix' ? 'block' : 'none';
        document.getElementById('ui-cartao').style.display = m === 'cartao' ? 'block' : 'none';
    }
};

const Checkout = {
    desconto: 0,
    atualizarTotal() {
        const sub = Estado.carrinho.filter(i => i.selecionado).reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
        document.getElementById('resumo-valores').innerHTML = `Total: R$ ${Math.max(0, sub - this.desconto).toFixed(2).replace('.', ',')}`;
    },
    aplicarCupom() {
        if (document.getElementById('input-cupom').value.toUpperCase() === 'PINK10') {
            this.desconto = 10; Toast.show("Cupom de R$ 10 aplicado!");
        } else { this.desconto = 0; Toast.show("Cupom inválido", "erro"); }
        this.atualizarTotal();
    },
    irParaPagamento() {
        if(Estado.carrinho.filter(i => i.selecionado).length === 0) return Toast.show("Selecione um item!", "erro");
        if(!Estado.usuarioAtual) {
            Toast.show("Faça login para continuar!", "erro");
            sessionStorage.setItem('intencao_checkout', 'sim');
            Modal.fechar('pagamento-sec'); Modal.abrir('login-sec');
            return;
        }
        Pagamento.abrirCarrinho(true);
    },
    voltarParaCarrinho() { Pagamento.abrirCarrinho(false); },
    finalizarPedido() {
        const cep = document.getElementById('cep').value;
        const num = document.getElementById('num-casa').value;
        if(!cep || !num) return Toast.show("Endereço incompleto!", "erro");

        if (Pagamento.metodo === 'cartao') {
            const cpf = document.getElementById('cpf-cartao').value;
            const card = document.getElementById('num-cartao').value;
            const data = document.getElementById('data-cartao').value;
            const cvc = document.getElementById('cvc-cartao').value;
            
            if(!Validador.cpf(cpf)) return Toast.show("CPF inválido!", "erro");
            if(!Validador.cartao(card)) return Toast.show("Número de cartão inválido!", "erro");
            if(!Validador.data(data)) return Toast.show("Validade inválida ou expirada!", "erro");
            if(!Validador.cvc(cvc)) return Toast.show("CVC inválido!", "erro");
        }

        // Salva endereço no perfil
        Estado.usuarioAtual.endereco = {
            cep, rua: document.getElementById('txt-endereco').innerText,
            numero: num, tipo: document.getElementById('tipo-residencia').value,
            complemento: document.getElementById('complemento').value
        };

        Loader.show('btn-finalizar');
        setTimeout(() => {
            const totalCompra = Estado.carrinho.filter(i => i.selecionado).reduce((acc, i) => acc + (i.preco * i.quantidade), 0) - this.desconto;
            
            // Adiciona ao histórico
            const novoPedido = {
                id: "PINK-" + Math.floor(Math.random() * 9000 + 1000),
                total: totalCompra,
                data: new Date().toLocaleDateString('pt-BR'),
                status: "Aprovado"
            };
            if(!Estado.usuarioAtual.historico) Estado.usuarioAtual.historico = [];
            Estado.usuarioAtual.historico.unshift(novoPedido);
            
            Estado.atualizarUsuarioNoBanco();
            Toast.show(`Pedido ${novoPedido.id} Confirmado!`);
            
            Estado.carrinho = Estado.carrinho.filter(i => !i.selecionado);
            Estado.salvar();
            Modal.fechar('pagamento-sec');
            Loader.hide('btn-finalizar');
        }, 2000);
    }
};

const Endereco = {
    async buscarCEP() {
        const cep = document.getElementById('cep').value.replace(/\D/g, '');
        if(cep.length !== 8) return Toast.show("CEP inválido!", "erro");
        Toast.show("Buscando endereço...");
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await res.json();
            if(dados.erro) throw new Error();
            document.getElementById('detalhes-endereco').style.display = 'block';
            document.getElementById('txt-endereco').innerText = `${dados.logradouro}, ${dados.bairro} - ${dados.localidade}/${dados.uf}`;
            document.getElementById('num-casa').focus();
        } catch(e) { Toast.show("CEP não encontrado.", "erro"); }
    }
};

document.addEventListener('DOMContentLoaded', () => { Estado.init(); Vitrine.carregar(); });
