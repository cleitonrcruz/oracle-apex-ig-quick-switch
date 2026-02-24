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

    // 2. Injetar o cellTemplate usando Polling (espera segura)
    // O APEX às vezes demora a construir o DOM da grid inteira. Vamos tentar até 10 vezes (max 2 seg).
    $('.a-IG').each(function () {
        var regionId = $(this).parent().attr('id');
        var tentativas = 0;

        var intervalId = setInterval(function () {
            tentativas++;

            // Tenta obter a instância da Region e do Widget interativo
            var region = apex.region(regionId);
            if (region && region.widget()) {
                var ig = region.widget().data("apex-interactiveGrid");

                // Só avançamos se a IG estiver 100% instanciada no DOM
                if (ig) {
                    clearInterval(intervalId); // Termina a espera!

                    var viewGrid = region.widget().interactiveGrid('getViews', 'grid');
                    if (viewGrid && viewGrid.view$) {
                        var columns = viewGrid.view$.grid('getColumns');
                        var modificou = false;

                        colunas.forEach(function (colNome) {
                            var col = columns.find(function (c) { return c.property === colNome; });

                            // Injeta o nosso HTML da bolinha
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
                }
            }

            // Timeout de segurança: Se a grelha nunca aparecer, desistimos após 10 tentativas.
            if (tentativas >= 10) {
                clearInterval(intervalId);
            }

        }, 200); // Verifica a cada 200 milissegundos
    });
}