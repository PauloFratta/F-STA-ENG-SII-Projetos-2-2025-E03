// logar-script.js - Versão "Fake" Local

// Pega a referência do formulário no HTML pelo ID
const cadastroForm = document.getElementById('cadastroForm');

// Adiciona um "escutador" para o evento de submit do formulário
cadastroForm.addEventListener('submit', async (event) => {
    // Impede o comportamento padrão do formulário (que é recarregar a página)
    event.preventDefault();

    // Pega os valores dos campos do formulário
    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;

    if (!nome || !email || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const payload = {
        usuario: nome,
        email: email,
        senha: senha
    };

    console.log('[INFO] Enviando dados de cadastro para o servidor local:', payload);

    try {
        const response = await fetch('http://localhost:3000/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) { // Status de sucesso (2xx)
            alert(data.mensagem);
            cadastroForm.reset();
        } else { // Status de erro (4xx, 5xx)
            alert(`Erro: ${data.mensagem}`);
        }
    } catch (error) {
        console.error('[ERRO] Não foi possível conectar ao servidor local:', error);
        alert('Falha ao conectar ao servidor. Verifique se o backend.js está rodando.');
    }
});

// ---- LÓGICA DO FORMULÁRIO DE LOGIN ----

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    if (!email || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const payload = { email, senha };

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.mensagem);
            
            // **Mágica acontece aqui:** Salvamos os dados do usuário no navegador
            localStorage.setItem('loggedInUser', JSON.stringify(data.usuario));
            
            // Redirecionamos para a página de perfil
            window.location.href = 'perfil.html';

        } else {
            alert(`Erro: ${data.mensagem}`);
        }
    } catch (error) {
        console.error('[ERRO] Falha ao tentar fazer login:', error);
        alert('Não foi possível conectar ao servidor.');
    }
});