/**
 * @plugin IG Quick Switch v2.0
 * @author Cleiton Cruz
 * @contact cleiton.rcruz@gmail.com | +55 (61) 9 8224-3863
 * @linkedin https://www.linkedin.com/in/cleiton-cruz-705373118/
 * @description Converte colunas nativas do Interactive Grid em interruptores Switch (S/N) no modo de leitura.
 */
function inicializarIgSwitch(colunasAlvoStr) {
    if (!colunasAlvoStr) return;

    // Converte a string (ex: "ATIVO, STATUS") num array ["ATIVO", "STATUS"]
    var colunas = colunasAlvoStr.split(',').map(function (c) { return c.trim(); });

    // 1. Delegação do Clique (Regista apenas 1 vez por página)
    if (!$('body').data('plugin-ig-switch-init')) {
        $('body').data('plugin-ig-switch-init', true);

        $('body').on('click', '.clica-switch', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Impede a grelha de entrar em modo de edição!

            var $btn = $(this);
            var idDaRegiao = $btn.closest('.a-IG').parent().attr('id');
            var grid = apex.region(idDaRegiao).widget().interactiveGrid("getViews", "grid");
            var model = grid.model;
            var linha = $btn.closest('tr');
            var record = grid.getContextRecord(linha)[0];
            var nomeColuna = $btn.data('coluna');

            if (record && nomeColuna) {
                // Impede múltiplos cliques enquanto anima
                if ($btn.hasClass('is-animating')) return;
                $btn.addClass('is-animating');

                var valorAtual = model.getValue(record, nomeColuna);
                var novoValor = (valorAtual === 'S') ? 'N' : 'S';

                // Atualiza visualmente primeiro para desencadear a transição CSS (0.3s)
                $btn.removeClass('status-S status-N').addClass('status-' + novoValor);

                // Aguarda 300ms antes de atualizar o "Oracle APEX model"
                // Motivo: O APEX destrói o HTML da célula e redesenha-o IMEDIATAMENTE ao fazer setValue.
                // Precisamos deste atraso para a animação CSS ter tempo de ser vista na íntegra.
                setTimeout(function () {
                    model.setValue(record, nomeColuna, novoValor);
                }, 300);
            }
        });
    }

    // 2. Injetar o cellTemplate na grelha 
    // Utilizamos execução IMEDIATA + fallback de Polling ultra-rápido para evitar o "piscar" visual (FOUC).
    $('.a-IG').each(function () {
        var regionId = $(this).parent().attr('id');

        function aplicarTemplate() {
            var region = apex.region(regionId);
            if (!region || !region.widget()) return false;

            var ig = region.widget().data("apex-interactiveGrid");
            if (!ig) return false;

            var viewGrid = region.widget().interactiveGrid('getViews', 'grid');
            if (viewGrid && viewGrid.view$) {
                var columns = viewGrid.view$.grid('getColumns');
                var modificou = false;

                colunas.forEach(function (colNome) {
                    var col = columns.find(function (c) { return c.property === colNome; });
                    if (col && (!col.cellTemplate || col.cellTemplate.indexOf('meu-switch-visual') === -1)) {
                        col.cellTemplate = '<div class="meu-switch-visual status-&' + colNome + '. clica-switch" data-coluna="' + colNome + '" style="cursor: pointer;"></div>';
                        modificou = true;
                    }
                });

                if (modificou) {
                    // Agendamos o refresh apenas das linhas de dados (evita desalinhar o cabeçalho 'stickyWidget')
                    setTimeout(function () {
                        try {
                            viewGrid.view$.grid("refresh");
                        } catch (e) { }
                    }, 50);
                }
                return true; // Sucesso / Já estava processado
            }
            return false;
        }

        // Tenta aplicar o template IMEDIATAMENTE (antes da query chegar do backend)
        if (!aplicarTemplate()) {
            // Se a grelha for pesada/adormecida: polling furioso a 20ms c/ safety timeout (1.5 seg)
            var tentativas = 0;
            var intervalId = setInterval(function () {
                tentativas++;
                if (aplicarTemplate() || tentativas >= 75) {
                    clearInterval(intervalId);
                }
            }, 20);
        }
    });
}