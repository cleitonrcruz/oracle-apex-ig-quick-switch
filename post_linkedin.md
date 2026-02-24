# 🚀 Como transformar as tuas Interactive Grids no Oracle APEX em segundos!

Quem trabalha com Oracle APEX sabe que os Interactive Grids (IG) são incrivelmente poderosos, mas por vezes a experiência do utilizador pode parecer um pouco... "dura". 

Uma das funcionalidades que os meus utilizadores mais pedem é a capacidade de alternar um valor (Sim/Não, Ativo/Inativo) **diretamente no modo de leitura (Read-Only)**, sem a fricção de ter duplo-clique para entrar no modo de edição da célula.

Foi por isso que desenvolvi o **IG Quick Switch v2.0**! 💡

Na primeira versão deste Plug-in, usávamos a técnica clássica de "Sweet Spot": criar uma coluna oculta com o dado real e uma coluna virtual com uma expressão HTML para desenhar o botão. Funcionava, mas obrigava-nos a perder tempo a colar código HTML em todas as páginas onde o usávamos.

### 🔥 O que há de novo na versão 2.0?

A V2.0 reescreveu completamente as regras do jogo! Deitámos fora a coluna virtual falsa e o código HTML manual. Agora, o Plug-in faz tudo sozinho de forma invisível:

1️⃣ **0% HTML:** Acabaram-se os `HTML Expressions`. Só tens de dizer ao Plug-in qual é a tua coluna de base de dados (Ex: `ATIVO`).
2️⃣ **Injeção Automática:** Através do `cellTemplate` API do Interactive Grid, o Plug-in injeta o botão visual na grelha no momento do Page Load.
3️⃣ **Desempenho Nativo:** O clique não só atualiza o visual da linha, mas comunica instantaneamente com o JavaScript Model original do APEX.
4️⃣ **Transições Suaves:** Adicionada uma transição CSS elástica e suave (300ms de animação de cor e movimento) sem que os *DOM refreshs* agressivos do APEX a cortem!

### ⏳ Tempo de Implementação? Literalmente 30 segundos!
Vê como é fácil usar na tua aplicação:
👉 Asseguras que a tua coluna base não está em modo "Value Protected"
👉 Crias uma Dynamic Action em *Page Load*.
👉 Selecionas o Plug-in e escreves o nome da tua coluna alvo (ex: `STATUS_PAGAMENTO`).

E pronto! Um toggle elástico, sem refresh da página, e com os dados sincronizados em sub-segundo!

Como é que costumam resolver este problema de UX nas vossas Interactive Grids? Costumam usar Action Columns, ícones ou já saltaram para este tipo de interações diretas? 👇

#OracleAPEX #APEXDeveloper #LowCode #UXDesign #JavaScript #PLSQL #WebDevelopment #InteractiveGrid
