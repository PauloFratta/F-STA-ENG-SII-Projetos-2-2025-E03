// backend.js - Versão Servidor Local
import express from 'express';
import fs from 'fs/promises'; // Para ler e escrever arquivos
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express();
const PORT = 3000;
const DB_PATH = '../db.json'; // Caminho para o nosso "banco de dados"

// Middlewares para permitir CORS e para que o Express entenda JSON
app.use(cors());
app.use(express.json());

// ---- ROTA DE CADASTRO ----
app.post('/cadastro', async (req, res) => {
    const { usuario, email, senha } = req.body;

    console.log(`[INFO] Recebida requisição de cadastro para o email: ${email}`);

    try {
        // 1. Lê o banco de dados atual
        const dbRaw = await fs.readFile(DB_PATH, 'utf-8');
        const usuarios = JSON.parse(dbRaw);

        // 2. Verifica se o email já existe
        const usuarioExistente = usuarios.find(u => u.email === email);
        if (usuarioExistente) {
            console.log(`[AVISO] Email ${email} já cadastrado.`);
            // Retorna um erro 409 (Conflict)
            return res.status(409).json({ mensagem: 'Este email já está em uso.' });
        }

        // 3. Hashear a senha (NUNCA pule esta etapa!)
        const saltRounds = 10;
        const senhaHasheada = await bcrypt.hash(senha, saltRounds);

        // 4. Adiciona o novo usuário
        const novoUsuario = { id: Date.now(), usuario, email, senha: senhaHasheada };
        usuarios.push(novoUsuario);

        // 5. Salva o banco de dados atualizado
        await fs.writeFile(DB_PATH, JSON.stringify(usuarios, null, 2));
        console.log(`[OK] Usuário ${usuario} cadastrado com sucesso.`);

        // 6. Envia a resposta de sucesso
        res.status(201).json({ mensagem: `Usuário ${usuario} cadastrado com sucesso!` });

    } catch (error) {
        console.error('[ERRO] Falha ao processar cadastro:', error);
        res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
});

// ---- ROTA DE LOGIN ----
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    console.log(`[INFO] Recebida tentativa de login para o email: ${email}`);

    try {
        // 1. Lê o banco de dados
        const dbRaw = await fs.readFile(DB_PATH, 'utf-8');
        const usuarios = JSON.parse(dbRaw);

        // 2. Procura o usuário pelo email
        const usuario = usuarios.find(u => u.email === email);
        if (!usuario) {
            console.log(`[AVISO] Tentativa de login para email não cadastrado: ${email}`);
            // Retorna erro 401 (Não Autorizado) - não damos a dica se foi o email ou a senha
            return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
        }

        // 3. Compara a senha enviada com a senha hasheada no banco de dados
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            console.log(`[AVISO] Tentativa de login com senha incorreta para o email: ${email}`);
            return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
        }

        // 4. Se tudo deu certo, login bem-sucedido!
        console.log(`[OK] Usuário ${usuario.usuario} logado com sucesso.`);
        
        // Remove a senha antes de enviar os dados de volta para o frontend
        const { senha: _, ...dadosUsuario } = usuario;

        res.status(200).json({ 
            mensagem: 'Login bem-sucedido!',
            usuario: dadosUsuario // Envia os dados do usuário (sem a senha)
        });

    } catch (error) {
        console.error('[ERRO] Falha ao processar login:', error);
        res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
});

// ---- ROTA PARA ATUALIZAR O PERFIL (FOTO/BIO) ----
app.patch('/perfil/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10); // Pega o ID da URL
    const { foto, bio } = req.body; // Pega os dados a serem atualizados

    console.log(`[INFO] Recebida requisição para atualizar perfil do usuário ID: ${userId}`);

    try {
        const dbRaw = await fs.readFile(DB_PATH, 'utf-8');
        let usuarios = JSON.parse(dbRaw);

        // Encontra o índice do usuário no array
        const userIndex = usuarios.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        // Atualiza os campos do usuário, se eles foram enviados na requisição
        if (foto) {
            usuarios[userIndex].foto = foto;
            console.log(`[INFO] Foto do usuário ${usuarios[userIndex].usuario} atualizada.`);
        }
        if (bio) {
            usuarios[userIndex].bio = bio;
            console.log(`[INFO] Bio do usuário ${usuarios[userIndex].usuario} atualizada.`);
        }

        // Salva o banco de dados com as alterações
        await fs.writeFile(DB_PATH, JSON.stringify(usuarios, null, 2));

        // Retorna o usuário completamente atualizado (sem a senha)
        const { senha: _, ...dadosUsuario } = usuarios[userIndex];
        res.status(200).json({ mensagem: 'Perfil atualizado com sucesso!', usuario: dadosUsuario });

    } catch (error) {
        console.error('[ERRO] Falha ao atualizar perfil:', error);
        res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
});


// Inicia o servidor...
app.listen(PORT, () => {
    // ...
});

// Inicia o servidor na porta definida
app.listen(PORT, () => {
    console.log(`[OK] Servidor "Fake" rodando na porta ${PORT}`);
    console.log('Aguardando requisições de cadastro...');
});