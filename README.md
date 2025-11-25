# 👥 Colaboradores
- Gabriel Henrique Loterio de Araujo
- Guilherme Reis dos Santos
- Rodrigo de Andrade Rodrigues
- Vitor Vieira Santos Ramos

# 🎮 Sakura Arcade - Plataforma de Aluguel de Jogos

Bem-vindo ao **Sakura Arcade**! Uma plataforma moderna e intuitiva para alugar jogos de PlayStation. Este projeto permite que você gerencie uma loja de aluguel de jogos completa, desde o cadastro de jogos até o controle de aluguéis e pagamentos.

---

## 📋 O que é este projeto?

O **Sakura Arcade** é um sistema completo que permite:

- 🎯 **Gerenciar jogos**: Adicione, edite e remova jogos do catálogo
- 👥 **Gerenciar usuários**: Controle de clientes e administradores
- 💰 **Sistema de pagamentos**: Processe pagamentos e gerencie carteiras digitais
- 📦 **Aluguel de jogos**: Controle completo de aluguéis, devoluções e disponibilidade
- 🏠 **Endereços**: Gerencie endereços de entrega dos clientes
- 📱 **Interface moderna**: Aplicativo mobile e web com design elegante

<img width="1916" height="901" alt="Captura de tela 2025-11-24 044444" src="https://github.com/user-attachments/assets/eb4be272-10b7-4bf7-abcb-7f619f0f77c0" />

---

## 🚀 Como começar

### Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 18 ou superior) - [Baixar aqui](https://nodejs.org/)
- **Bun** (gerenciador de pacotes) - [Baixar aqui](https://bun.sh/)
- **PostgreSQL** (banco de dados) - [Baixar aqui](https://www.postgresql.org/download/)



#### 2️⃣ Configure o Backend (Servidor)

1. Entre na pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o banco de dados:
   - Crie um arquivo `.env` na pasta `backend`
   - Adicione a seguinte linha (substitua pelos seus dados):
     ```
     DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco
     ```

4. Execute as migrações do banco de dados:
   ```bash
   npm run migrate
   ```

5. Inicie o servidor:
   ```bash
   npm run dev
   ```

   ✅ O servidor estará rodando em: `http://localhost:3000`

#### 3️⃣ Configure o Frontend (Aplicativo)

1. Abra um novo terminal e entre na pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o aplicativo:
   ```bash
   npm run dev
   ```

   ✅ O aplicativo abrirá automaticamente no seu navegador ou você pode escanear o QR code com o app Expo Go no seu celular.

---

## 📱 Como usar

### Primeiro acesso

1. **Crie uma conta**: Clique em "Criar Conta" na tela de login
2. **Faça login**: Use seu email e senha para entrar
3. **Explore o catálogo**: Navegue pelos jogos disponíveis
4. **Alugue um jogo**: Selecione um jogo e faça o aluguel
5. **Gerencie seus aluguéis**: Veja seus aluguéis ativos na seção "Meus Aluguéis"

### Para administradores

- Acesse a área administrativa para gerenciar jogos, usuários e aluguéis
- Adicione novos jogos ao catálogo
- Controle o estoque e disponibilidade
- Visualize relatórios e estatísticas

---

## 📁 Estrutura do Projeto

```
Sakura Arcade/
├── backend/          # Servidor e API
│   ├── src/          # Código fonte
│   └── dist/         # Código compilado
│
└── frontend/         # Aplicativo mobile/web
    ├── app/          # Telas do aplicativo
    ├── components/   # Componentes reutilizáveis
    └── data/         # Funções de comunicação com a API
```

---

## 🛠️ Comandos úteis

### Backend

```bash
npm run dev      # Inicia o servidor em modo desenvolvimento
npm run build    # Compila o código para produção
npm run start    # Inicia o servidor em modo produção
npm run migrate  # Executa migrações do banco de dados
```

### Frontend

```bash
npm run dev      # Inicia o aplicativo em modo desenvolvimento
npm run android  # Abre no emulador Android
npm run ios      # Abre no simulador iOS
npm run web      # Abre no navegador web
```

---

## 🔧 Solução de problemas

### O servidor não inicia

- Verifique se o PostgreSQL está rodando
- Confirme se o arquivo `.env` está configurado corretamente
- Verifique se a porta 3000 não está sendo usada por outro programa

### O aplicativo não carrega

- Certifique-se de que o servidor backend está rodando
- Verifique sua conexão com a internet
- Tente limpar o cache: `npm run clean` (no frontend)

### Erro de banco de dados

- Verifique se o PostgreSQL está instalado e rodando
- Confirme se o banco de dados foi criado
- Execute as migrações novamente: `npm run migrate`

---


## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 🙏 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- 🐛 Reportar bugs
- 💡 Sugerir novas funcionalidades
- 🔧 Enviar melhorias de código
- 📝 Melhorar a documentação

---

## ⭐ Agradecimentos

Obrigado por usar o **Sakura Arcade**! Esperamos que você tenha uma ótima experiência.

---

**Desenvolvido com ❤️ para gamers**
