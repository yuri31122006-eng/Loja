/**
 * MÓDULO UI (INTERFACE DO USUÁRIO) - ATUALIZADO 3.0
 * Gerencia a visibilidade de componentes e interações de tela.
 */

const Modal = {
    abrir(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('aberta');
            document.body.style.overflow = 'hidden'; 
        }
    },
    fechar(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('aberta');
            document.body.style.overflow = 'auto'; 
            
            if(id === 'login-sec' && typeof Auth !== 'undefined') {
                setTimeout(() => Auth.resetar(), 400);
            }
        }
    }
};

const Menu = {
    abrir() {
        document.getElementById('menu-lateral').classList.add('aberto');
        document.getElementById('overlay-menu').classList.add('ativo');
    },
    fechar() {
        document.getElementById('menu-lateral').classList.remove('aberto');
        document.getElementById('overlay-menu').classList.remove('ativo');
    },
    navegarPara(idSecao) {
        this.fechar();
        setTimeout(() => {
            const el = document.getElementById(idSecao);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }
};

const Toast = {
    show(mensagem, tipo = 'sucesso') {
        const t = document.createElement('div');
        t.className = 'toast';
        t.style.borderLeftColor = tipo === 'sucesso' ? '#D81B60' : '#ffa000';
        
        const icone = tipo === 'sucesso' ? '🌸' : '⚠️';
        t.innerHTML = `<span style="margin-right: 10px;">${icone}</span> ${mensagem}`;
        
        document.body.appendChild(t);
        
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateX(20px)';
            setTimeout(() => t.remove(), 500);
        }, 3000);
    }
};

const Loader = {
    show(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.dataset.old = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span>';
        }
    },
    hide(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.old;
        }
    }
};
