//para funcionar navegação via ajax os ids devem ser únicos em cada tela
$(document).ready(function () {
    //clicar no botão da div de erros e escondendo as mensagens de erros
    $("#div_mensagem_botao_menu").click(function () {
        $("#div_mensagem_menu").hide();
    });

    $("#simulador_link").click(function () {
        $(location).prop("href", "menu.php");
    });

    $("#material_link").click(function (e) {
        $("#conteudo").load("material_index.php");
    });

    $("#eletrodo_link").click(function (e) {
        $("#conteudo").load("eletrodo_index.php");
    });

    $("#operacao_link").click(function (e) {
        $("#conteudo").load("operacao_index.php");
    });

    $("#ponto_link").click(function (e) {
        $("#conteudo").load("ponto_index.php");
    });

    $("#usuario_link").click(function (e) {
        $("#conteudo").load("usuario_index.php");
    });

    $("#logout_modal_sim").click(function (e) {
        $(location).attr("href", "logout.php");
    });

    $("#sobre_link").click(function () {
        $("#sobre_modal").modal("show");
    });

    $("#logout_link").click(function () {
        $("#logout_modal").modal("show");
    });

    $('#botao_pesquisar_simulador').click(function (e) {
        var operacao = $("#operacao option:selected").val();
        var eletrodo = $("#eletrodo_simulador option:selected").val();
        var polaridade = $("#polaridade_simulador option:selected").val();
        var corrente = $("#corrente option:selected").val();
        var relacao = $("#relacao option:selected").val();
        var html = "";

        //regerando o canvas para não ter erro no gráfico
        $("#div_ponto").html("");
        $("#div_mensagem_menu").hide();
        //regerando o canvas para não ter erro no gráfico Desgaste
        $("#div_ponto_desgaste").html("");
        $("#div_mensagem_menu").hide();
        //regerando o canvas para não ter erro no gráfico Rugosidade
        $("#div_ponto_rugosidade").html("");
        $("#div_mensagem_menu").hide();


        $.ajax({
            type: "POST",
            cache: false,
            url: "ponto_crud.php",
            data: {
                acao: "simulador",
                operacao_id: operacao,
                eletrodo_id: eletrodo,
                polaridade: polaridade,
                valor_corrente: corrente,
                valor_relacao: relacao


            },
            dataType: "json",
            success: function (data) {
                if (data.length > 0) {
                    html = "<table class='table table-striped table-hover'>";
                    html += "<thead class='table-info'>";
                    html += "<tr>";
                    html += "<th scope='col'>ID</th>";
                    html += "<th scope='col'>Material</th>";
                    html += "<th scope='col'>Eletrodo</th>";
                    html += "<th scope='col'>Polaridade</th>";
                    html += "<th scope='col'>Operação</th>";
                    html += "<th scope='col'>Ação</th>";
                    html += "</tr></thead><tbody>";
                    $.each(data, function (i, item) {
                        html += "<tr>";
                        html += "<td>" + item.id + "</td>";
                        html += "<td>" + item.material + "</td>";
                        html += "<td>" + item.eletrodo + "</td>";
                        html += "<td>" + item.polaridade + "</td>";
                        html += "<td>" + item.operacao + "</td>";
                        html += "<td>" + "<a id='botao_grafico_ponto' chave='" + item.id + "' class='btn btn-info btn-sm' title='Gráfico'><i class='fas fa-chart-bar'></i></a>" + "</td>";
                        html += "</tr>";
                    });
                    html += "</tbody></table>";

                    $("#div_ponto").append(html);
                } else {
                    $("#div_mensagem_texto_menu").empty().append("Nenhum ponto encontrado!");
                    $("#div_mensagem_menu").show();
                }
            },
            error: function (e) {
                $("#div_mensagem_texto_menu").empty().append(e.responseText);
                $("#div_mensagem_menu").show();
            },
            beforeSend: function () {
                $("#carregando_menu").removeClass("d-none");
            },
            complete: function () {
                $("#carregando_menu").addClass("d-none");
            }
        });
    });

    //botão visualizar da tela de listagem de registros
    $(document).on("click", "#botao_grafico_ponto", function (e) {
        e.stopImmediatePropagation();
        //levando os elementos para tela de consulta para depois realizar as buscas/pesquisas
        var id = $(this).attr("chave");
        //var eletrodo = $("#eletrodo_simulador option:selected").val();
        var corrente = $("#corrente").val();
        var relacao = $("#relacao").val();




        //  Configuração do Grafico da Taxa de Remoção
        $("#div_ponto").html("");
        $("#div_ponto").append("<canvas id='grafico'></canvas>");

        $.ajax({
            type: "POST",
            cache: false,
            url: "ponto_crud.php",
            data: {
                acao: "grafico",
                valor_corrente: corrente,
                valor_relacao: relacao,

            },
            dataType: "json",
            success: function (data) {
                var duracaoArray = [];
                var correnteArray = [];
                var remocaoArray = [];
                var eletrodoArray = [];

                for (var i = 0; i < data.length; i++) {
                    duracaoArray.push(data[i].duracao);
                    correnteArray.push(data[i].valor_corrente);
                    remocaoArray.push(data[i].valor_remocao);
                    eletrodoArray.push(data[i].eletrodo_id);
                }

                var duracao = duracaoArray.filter(function (este, i) {
                    return duracaoArray.indexOf(este) === i;
                });


                var cobreArray = [];
                var cuWArray = [];
                var grNegativoArray = [];
                var grPositivoArray = [];


                for (var i = 0; i < remocaoArray.length; i++) {

                    if (eletrodoArray[i] == 1) {

                        cobreArray.push(remocaoArray[i]);

                    } else if (eletrodoArray[i] == 2) {

                        cuWArray.push(remocaoArray[i]);

                    } else if (eletrodoArray[i] == 3) {

                        grNegativoArray.push(remocaoArray[i]);

                    } else if (eletrodoArray[i] == 4) {

                        grPositivoArray.push(remocaoArray[i]);
                    }
                }

                grafico(duracao, correnteArray, cobreArray, cuWArray, grNegativoArray, grPositivoArray);
            }
        });


        function grafico(duracao, corrente, cobre, cuW, grNegativo, grPositivo) {

            console.log("Array de duracao : " + duracao);
            var ctx = document.getElementById("grafico").getContext('2d')

            var chart = new Chart(ctx, {

                type: 'line',
                data: {
                    labels: duracao,
                    datasets: [
                        {
                            label: 'Cobre',
                            pointStyle: 'circle',
                            backgroundColor: 'rgba(163, 31, 15, 188)', // legenda
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(122, 22, 11,48)',
                            data: cobre
                        },
                        {
                            label: 'CuW',
                            pointStyle: 'rectRounded',
                            backgroundColor: 'rgba(10, 163, 28, 188)',
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(7, 122, 21, 48)',
                            data: cuW
                        },
                        {
                            label: 'Gr(-)',
                            pointStyle: 'rectRot',
                            backgroundColor: 'rgba(163, 146, 9, 188)',
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(122, 109, 7,48)',
                            data: grNegativo
                        },
                        {
                            label: 'Gr (+)',
                            pointStyle: 'triangle',
                            backgroundColor: 'rgba(18, 77, 122,188)',
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(16,69, 110,43)',
                            data: grPositivo
                        }]
                },

                options: {
                    responsive: true,
                    radius: 2,
                    pointRadius: 5,
                    hoverRadius: 15,
                    // hoverBackgroundColor: 'rgb(180, 180, 180)',
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            position: "top",
                        },
                        title: {
                            display: true,
                            text: "Corrente "
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: "Taxa de Remoção",
                                font: {
                                    weight: "bold",
                                }
                            }
                        },
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: "Duração",
                                font: {
                                    weight: "bold",
                                }
                            }
                        }
                    }
                }
            });
        }


        //  Configuração do Grafico de Desgaste

        $("#div_ponto_desgaste").html("");
        $("#div_ponto_desgaste").append("<canvas id='graficoDesgaste'></canvas>");

        //  Grafico da Desgaste
        $.ajax({
            type: "POST",
            cache: false,
            url: "ponto_crud.php",
            data: {
                acao: "graficoDesgaste",
                valor_corrente: corrente,
                valor_relacao: relacao,
            },
            dataType: "json",
            success: function (data) {
                var duracaoArray = [];
                var correnteArray = [];
                var desgasteArray = [];
                var eletrodoArray = [];

                for (var i = 0; i < data.length; i++) {
                    duracaoArray.push(data[i].duracao);
                    correnteArray.push(data[i].valor_corrente);
                    desgasteArray.push(data[i].valor_desgaste);
                    eletrodoArray.push(data[i].eletrodo_id);

                }

                var duracao = duracaoArray.filter(function (este, i) {
                    return duracaoArray.indexOf(este) === i;
                });

                var cobreArray = [];
                var cuWArray = [];
                var grNegativoArray = [];
                var grPositivoArray = [];


                for (var i = 0; i < desgasteArray.length; i++) {

                    if (eletrodoArray[i] == 1) {

                        cobreArray.push(desgasteArray[i]);

                    } else if (eletrodoArray[i] == 2) {

                        cuWArray.push(desgasteArray[i]);

                    } else if (eletrodoArray[i] == 3) {

                        grNegativoArray.push(desgasteArray[i]);

                    } else if (eletrodoArray[i] == 4) {

                        grPositivoArray.push(desgasteArray[i]);
                    }
                }

                graficoDesgaste(duracao, correnteArray, cobreArray, cuWArray, grNegativoArray, grPositivoArray);
            }
        });


        function graficoDesgaste(duracao, corrente, cobre, cuW, grNegativo, grPositivo) {

            var ctx = document.getElementById("graficoDesgaste").getContext('2d')

            var chart = new Chart(ctx, {

                type: 'line',
                data: {
                    labels: duracao,
                    datasets: [
                        {
                            label: 'Cobre',
                            pointStyle: 'circle',
                            backgroundColor: 'rgba(163, 31, 15, 188)', // legenda
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(122, 22, 11,48)',
                            data: cobre
                        },
                        {
                            label: 'CuW',
                            pointStyle: 'rectRounded',
                            backgroundColor: 'rgba(10, 163, 28, 188)',
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(7, 122, 21, 48)',
                            data: cuW
                        },
                        {
                            label: 'Gr(-)',
                            pointStyle: 'rectRot',
                            backgroundColor: 'rgba(163, 146, 9, 188)',
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(122, 109, 7,48)',
                            data: grNegativo
                        },
                        {
                            label: 'Gr (+)',
                            pointStyle: 'triangle',
                            backgroundColor: 'rgba(18, 77, 122,188)',
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(16,69, 110,43)',
                            data: grPositivo
                        }]
                },

                options: {
                    responsive: true,
                    radius: 2,
                    pointRadius: 5,
                    hoverRadius: 15,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "top",
                            
                        },
                        title: {
                            display: true,
                            text: "Corrente "
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: "Desgaste Relativo",
                                font: {
                                    weight: "bold",
                                }
                            }
                        },
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: "Duração",
                                font: {
                                    weight: "bold",
                                }
                            }
                        }
                    }
                }
            });

        }


        //  Configuração do Gráfico de Rugosidade

        $("#div_ponto_rugosidade").html("");
        $("#div_ponto_rugosidade").append("<canvas id='graficoRugosidade'></canvas>");

        $.ajax({
            type: "POST",
            cache: false,
            url: "ponto_crud.php",
            data: {
                acao: "graficoRugosidade",
                valor_corrente: corrente,
                valor_relacao: relacao,
            },
            dataType: "json",
            success: function (data) {
                var duracaoArray = [];
                var correnteArray = [];
                var rugosidadeArray = [];
                var eletrodoArray = [];

                for (var i = 0; i < data.length; i++) {
                    duracaoArray.push(data[i].duracao);
                    correnteArray.push(data[i].valor_corrente);
                    rugosidadeArray.push(data[i].valor_rugosidade);
                    eletrodoArray.push(data[i].eletrodo_id);
                }


                var duracao = duracaoArray.filter(function (este, i) {
                    return duracaoArray.indexOf(este) === i;
                });

                var cobreArray = [];
                var cuWArray = [];
                var grNegativoArray = [];
                var grPositivoArray = [];


                for (var i = 0; i < rugosidadeArray.length; i++) {

                    if (eletrodoArray[i] == 1) {

                        cobreArray.push(rugosidadeArray[i]);

                    } else if (eletrodoArray[i] == 2) {

                        cuWArray.push(rugosidadeArray[i]);

                    } else if (eletrodoArray[i] == 3) {

                        grNegativoArray.push(rugosidadeArray[i]);

                    } else if (eletrodoArray[i] == 4) {

                        grPositivoArray.push(rugosidadeArray[i]);
                    }
                }

                graficoRugosidade(duracao, correnteArray, cobreArray, cuWArray, grNegativoArray, grPositivoArray);
            }
        });


        function graficoRugosidade(duracao, corrente, cobre, cuW, grNegativo, grPositivo) {

            var ctx = document.getElementById("graficoRugosidade").getContext('2d')

            var chart = new Chart(ctx, {

                type: 'line',
                data: {
                    labels: duracao,
                    datasets: [
                        {
                            label: 'Cobre',
                            pointStyle: 'circle',
                            backgroundColor: 'rgba(163, 31, 15, 188)', // legenda
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(122, 22, 11,48)',
                            data: cobre
                        },
                        {
                            label: 'CuW',
                            pointStyle: 'rectRounded',
                            backgroundColor: 'rgba(10, 163, 28, 188)',
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(7, 122, 21, 48)',
                            data: cuW
                        },
                        {
                            label: 'Gr(-)',
                            pointStyle: 'rectRot',
                            backgroundColor: 'rgba(163, 146, 9, 188)',
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(122, 109, 7,48)',
                            data: grNegativo
                        },
                        {
                            label: 'Gr (+)',
                            pointStyle: 'triangle',
                            backgroundColor: 'rgba(18, 77, 122,188)',
                            //borderColor: ['red', 'blue', 'green', 'yellow'],
                            borderColor: 'rgba(16,69, 110,43)',
                            data: grPositivo
                        }]
                },

                options: {
                    responsive: true,
                    radius: 2,
                    pointRadius: 5,
                    hoverRadius: 15,

                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "top",
                        },
                        title: {
                            display: true,
                            text: "Corrente "
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: "Rugosidade",
                                font: {
                                    weight: "bold",
                                }
                            }
                        },
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: "Duração",
                                font: {
                                    weight: "bold",
                                }
                            }
                        }
                    }
                }
            });
        }
    });













    // populando os eletrodos conforme altera o material
    $("#material_simulador").change(function (e) {
        e.stopImmediatePropagation();

        $("#carregando_menu").removeClass("d-none");

        $.ajax({
            type: "POST",
            cache: false,
            url: "eletrodo_crud.php",
            data: {
                acao: "simulador",
                id: $("#material_simulador option:selected").val()
            },
            dataType: "json",
            success: function (e) {
                var html = "";
                $.each(e, function (i, item) {
                    html += "<option value='" + item.id + "'>" + item.descricao + "</option>";
                });
                $("#eletrodo_simulador").html(html);
            },
            error: function (e) {
                $("#div_mensagem_texto_menu").empty().append(e.responseText);
                $("#div_mensagem_menu").show();
            },
            complete: function () {
                $('#carregando_menu').css({
                    display: "none"
                });
            }
        });
    });

    // chamando o evento para carregar os eletrodos ao iniciar a página
    $("#material_simulador").change();

    const showNavbar = (toggleId, navId, bodyId, headerId) => {
        const toggle = document.getElementById(toggleId),
            nav = document.getElementById(navId),
            bodypd = document.getElementById(bodyId),
            headerpd = document.getElementById(headerId)

        // Validate that all variables exist
        if (toggle && nav && bodypd && headerpd) {
            toggle.addEventListener('click', () => {
                // show navbar
                nav.classList.toggle('showtab')
                // change icon
                toggle.classList.toggle('fa-times')
                // add padding to body
                bodypd.classList.toggle('body')
                // add padding to header
                headerpd.classList.toggle('body')
            })
        }
    }

    showNavbar('header-toggle', 'nav-bar', 'body', 'header');

    /*===== LINK ACTIVE =====*/
    const linkColor = document.querySelectorAll('.nav_link');

    function colorLink() {
        if (linkColor) {
            linkColor.forEach(l => l.classList.remove('activemenu'));
            this.classList.add('activemenu');
        }
    }
    linkColor.forEach(l => l.addEventListener('click', colorLink));


});


