document.addEventListener("DOMContentLoaded", () => {

    const usuario = JSON.parse(localStorage.getItem("usuario")) || { nome: "Aluno", role: "aluno" };
    document.getElementById("nomeUsuario").textContent = usuario.nome;

    // Mock de projetos e iniciativas do aluno
    const projetosDoAluno = [
        {
            id: 1, titulo: "Robótica Sustentável", iniciativas: [
                { id: 11, nome: "Montagem das estruturas" },
                { id: 12, nome: "Relatório final" }
            ]
        },
        {
            id: 2, titulo: "Feira de Jogos Educacionais", iniciativas: [
                { id: 21, nome: "Design do jogo" }
            ]
        }
    ];

    const selectProjeto = document.getElementById("selectProjeto");
    const selectIniciativa = document.getElementById("selectIniciativa");
    const listaEvidencias = document.getElementById("listaEvidencias");

    projetosDoAluno.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.titulo;
        selectProjeto.appendChild(opt);
    });

    selectProjeto.addEventListener("change", atualizarIniciativas);
    atualizarIniciativas();

    function atualizarIniciativas() {
        selectIniciativa.innerHTML = "";
        const projetoSel = projetosDoAluno.find(p => p.id == selectProjeto.value);
        projetoSel.iniciativas.forEach(i => {
            const opt = document.createElement("option");
            opt.value = i.id;
            opt.textContent = i.nome;
            selectIniciativa.appendChild(opt);
        });
    }

    // mock evidências já enviadas
    const evidencias = [];

    document.getElementById("btnEnviar").addEventListener("click", () => {
        const arquivos = document.getElementById("inputArquivo").files;

        if (!arquivos.length) return alert("Selecione pelo menos um arquivo!");

        // adiciona cada arquivo como uma evidência separada
        for (let arquivo of arquivos) {
            evidencias.push({
                nome: arquivo.name,
                status: "pendente",
                projeto: selectProjeto.value,
                iniciativa: selectIniciativa.value
            });
        }

        // limpa seleção visualmente
        document.getElementById("inputArquivo").value = "";

        render();
    });


    function render() {
        listaEvidencias.innerHTML = "";

        evidencias.forEach(ev => {
            const item = document.createElement("div");
            item.className = "item-evidencia";

            const status = (ev.status === "aprovada") ? "var(--aberto)" :
                (ev.status === "rejeitada") ? "var(--rejeitado)" : "var(--pendente)";

            item.innerHTML = `
      <div class="status-pendente" style="background:${status};"></div>
      <div>
        <span class="evidencia-nome">${ev.nome}</span><br>
        <small>Status: ${ev.status}</small>
      </div>
      <a href="#" title="Visualizar arquivo" style="text-decoration:none; font-size:14px;">📄</a>
    `;

            listaEvidencias.appendChild(item);
        });
    }



    render();
});
