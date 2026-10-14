StudyFlow — Organizador de Estudos

O StudyFlow é uma aplicação web desenvolvida para ajudar estudantes a organizar suas tarefas acadêmicas, acompanhar seu progresso e manter o foco durante os estudos.

O projeto foi criado como um MVP (Produto Mínimo Viável), com funcionalidades essenciais para demonstrar como a tecnologia pode facilitar a organização da rotina de estudos.

🎯 Objetivo

Oferecer uma ferramenta simples e intuitiva para que estudantes possam planejar suas atividades, definir prioridades e acompanhar suas tarefas pendentes e concluídas.

👥 Público-alvo

- Estudantes do ensino médio;
- Universitários;
- Pessoas que estudam para concursos ou provas;
- Qualquer pessoa que queira organizar sua rotina de estudos.

✨ Funcionalidades

- Cadastro de tarefas de estudo;
- Edição e exclusão de tarefas;
- Definição de matéria, prazo e prioridade;
- Marcação de tarefas como concluídas;
- Filtros para visualizar as tarefas;
- Painel com indicadores de progresso;
- Cronômetro de foco baseado na técnica Pomodoro;
- Validação dos campos do formulário;
- Armazenamento das tarefas no navegador usando `localStorage`;
- Interface responsiva para diferentes tamanhos de tela.

🛠️ Tecnologias utilizadas

- **HTML5:** estrutura da aplicação;
- **CSS3:** estilização e responsividade;
- **Bootstrap 5:** componentes e recursos de interface;
- **JavaScript:** interatividade, validação, gerenciamento de tarefas e cronômetro;
- **LocalStorage:** armazenamento local das tarefas no navegador.

📁 Estrutura do projeto

```text
StudyFlow/
├── index.html
├── style.css
├── script.js
└── README.md
```

🚀 Como executar

1. Baixe ou clone este repositório.
2. Abra a pasta do projeto no Visual Studio Code.
3. Abra o arquivo `index.html` no navegador.

Você também pode utilizar a extensão **Live Server** do VS Code para executar o projeto durante o desenvolvimento.

Não é necessário instalar dependências com npm ou configurar um servidor backend.

💾 Armazenamento de dados

O StudyFlow utiliza o `localStorage` do navegador para salvar as tarefas.

Isso permite que as informações permaneçam disponíveis após fechar e abrir a página no mesmo navegador e perfil. Entretanto, os dados não são sincronizados automaticamente entre dispositivos e não existe um banco de dados remoto nesta versão.

📌 O projeto como MVP

Esta versão implementa as funcionalidades principais para validar a proposta de um organizador de estudos.

Melhorias futuras

- Calendário semanal de estudos;
- Estatísticas de tempo dedicado a cada matéria;
- Lembretes de tarefas e prazos;
- Cadastro e autenticação de usuários;
- Banco de dados e sincronização entre dispositivos.

Essas melhorias poderão ser implementadas em versões futuras.

