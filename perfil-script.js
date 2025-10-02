// perfil-script.js (Versão Final)

document.addEventListener('DOMContentLoaded', () => {
    const userDataString = localStorage.getItem('loggedInUser');

    if (!userDataString) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'logar.html';
        return;
    }

    const user = JSON.parse(userDataString);

    // --- Elementos da Página ---
    const tituloPerfil = document.getElementById('titulo-perfil');
    const userName = document.getElementById('user-name');
    const userPhoto = document.getElementById('user-photo');
    const userBio = document.getElementById('user-bio');
    const logoutButton = document.getElementById('logout-button');
    const editarFotoBtn = document.getElementById('editar-foto-btn');
    const editarBioBtn = document.getElementById('editar-bio-btn');

    // --- Função para preencher os dados na tela ---
    function popularDadosDoPerfil(usuario) {
        tituloPerfil.textContent = `Perfil de ${usuario.usuario}`;
        userName.textContent = usuario.usuario;
        userBio.textContent = usuario.bio || 'Nenhuma bio definida.';
        userPhoto.src = usuario.foto || 'imagens/Artigo TapaBuraco.gif';
    }

    // --- Função para atualizar o perfil no backend ---
    async function atualizarPerfil(dadosParaAtualizar) {
        try {
            const response = await fetch(`http://localhost:3000/perfil/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaAtualizar),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensagem);
            }

            // Atualiza os dados no localStorage e na tela
            localStorage.setItem('loggedInUser', JSON.stringify(data.usuario));
            popularDadosDoPerfil(data.usuario);
            alert('Perfil atualizado com sucesso!');

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert(`Erro: ${error.message}`);
        }
    }

    // --- Event Listeners dos Botões ---
    
    // Logout
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        alert('Você foi desconectado.');
        window.location.href = 'logar.html';
    });

    // Editar Foto
    editarFotoBtn.addEventListener('click', () => {
        const novaFotoUrl = prompt('Digite a URL da sua nova foto de perfil:');
        if (novaFotoUrl) { // Só atualiza se o usuário digitou algo
            atualizarPerfil({ foto: novaFotoUrl });
        }
    });

    // Editar Bio
    editarBioBtn.addEventListener('click', () => {
        const novaBio = prompt('Digite sua nova bio (até 160 caracteres):');
        if (novaBio) {
            atualizarPerfil({ bio: novaBio.substring(0, 160) }); // Garante o limite de caracteres
        }
    });


    // --- Inicialização ---
    // Preenche os dados do perfil assim que a página carrega
    popularDadosDoPerfil(user);
});