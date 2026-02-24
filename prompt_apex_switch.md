# Prompt de Continuidade: Parceiro de Programação

Olá! Quero que atues como o meu "Parceiro de Programação". A tua missão é ajudar-me com programação (escrever, corrigir e entender código) de forma positiva, didática e com linguagem simples. Explica sempre o panorama geral e fornece o código completo com comentários.

## Contexto do Projeto
Estou a desenvolver uma aplicação no Oracle APEX. Criei recentemente uma solução "Sweet Spot" V2 para um botão Switch personalizado dentro de um *Interactive Grid*. A arquitetura separa os dados do visual, e a injeção do botão é feita **automaticamente via JavaScript**:
1. Uma coluna normal da grelha (Text Field ou Display Only) guarda os valores 'S' ou 'N' na base de dados.
2. Não existe coluna Virtual HTML.
3. Um Plug-in do tipo `Dynamic Action` recebe os nomes das colunas como parâmetro (String com nomes separados por vírgula), injeta o CSS e o `cellTemplate` (o HTML do botão) e faz com que o clique atualize diretamente o model do APEX, forçando a grelha a re-desenhar a célula com a cor correta.

## Códigos da Solução Atual

### 1. HTML Base (Apenas injetado via cellTemplate do IG pelo JS)
```html
<div class="meu-switch-visual status-&NOME_DA_COLUNA. clica-switch" data-coluna="NOME_DA_COLUNA" style="cursor: pointer;"></div>
```

### 2. CSS (Carregado pelo Plug-in no ficheiro switch.css)
```css
.meu-switch-visual { display: inline-block; width: 50px; height: 24px; border-radius: 20px; background-color: #f0f0f0; position: relative; box-shadow: inset 0 0 0 1px #e0e0e0; vertical-align: middle; }
.meu-switch-visual::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background-color: white; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.2); transition: all 0.2s ease; }
.meu-switch-visual.status-S { background-color: #005fcc; box-shadow: inset 0 0 0 1px #005fcc; }
.meu-switch-visual.status-S::after { left: calc(100% - 22px); }
.meu-switch-visual.status-S::before { content: 'ON'; position: absolute; color: white; font-size: 10px; font-weight: bold; top: 6px; left: 8px; font-family: Arial, sans-serif; }
.meu-switch-visual.status-N::before { content: 'OFF'; position: absolute; color: #555555; font-size: 10px; font-weight: bold; top: 6px; right: 8px; font-family: Arial, sans-serif; }
```

### 3. JavaScript (Carregado pelo Plug-in no ficheiro switch.js)
```javascript
function inicializarIgSwitch(colunasAlvoStr) {
    if (!colunasAlvoStr) return;
    var colunas = colunasAlvoStr.split(',').map(function(c) { return c.trim(); });

    if (!$('body').data('plugin-ig-switch-init')) {
        $('body').data('plugin-ig-switch-init', true);
        $('body').on('click', '.clica-switch', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $btn = $(this);
            var idDaRegiao = $btn.closest('.a-IG').parent().attr('id'); 
            var grid = apex.region(idDaRegiao).widget().interactiveGrid("getViews", "grid");
            var model = grid.model;
            var linha = $btn.closest('tr');
            var record = grid.getContextRecord(linha)[0];
            var nomeColuna = $btn.data('coluna'); 
            if (record && nomeColuna) {
                var valorAtual = model.getValue(record, nomeColuna);
                var novoValor = (valorAtual === 'S') ? 'N' : 'S';
                model.setValue(record, nomeColuna, novoValor);
            }
        });
    }

    $('.a-IG').each(function() {
        var regionId = $(this).parent().attr('id');
        var viewGrid = apex.region(regionId).widget().interactiveGrid('getViews', 'grid');
        if (viewGrid && viewGrid.view$) {
            var columns = viewGrid.view$.grid('getColumns');
            var modificou = false;
            colunas.forEach(function(colNome) {
                var col = columns.find(function(c) { return c.property === colNome; });
                if (col && (!col.cellTemplate || col.cellTemplate.indexOf('meu-switch-visual') === -1)) {
                    col.cellTemplate = '<div class="meu-switch-visual status-&' + colNome + '. clica-switch" data-coluna="' + colNome + '" style="cursor: pointer;"></div>';
                    modificou = true;
                }
            });
            if (modificou) {
                viewGrid.view$.grid("refreshColumns");
                viewGrid.view$.grid("refresh");
            }
        }
    });
}
```

### 4. PL/SQL (Função de Renderização do Plug-in)
```plsql
FUNCTION render_ig_switch (
    p_dynamic_action IN apex_plugin.t_dynamic_action,
    p_plugin         IN apex_plugin.t_plugin 
) RETURN apex_plugin.t_dynamic_action_render_result IS
    l_result apex_plugin.t_dynamic_action_render_result;
    l_colunas        VARCHAR2(2000) := p_dynamic_action.attribute_01;
BEGIN
    l_result.javascript_function := 'function(){ inicializarIgSwitch("' || l_colunas || '"); }';
    RETURN l_result;
END render_ig_switch;
```

**O Meu Novo Objetivo**
Quero usar esta mesma lógica para aplicar noutra página, mas preciso da tua ajuda para... (Descreve aqui o que queres fazer a seguir, por exemplo: adicionar uma notificação de sucesso, implementar na página X, adicionar validação, etc.).