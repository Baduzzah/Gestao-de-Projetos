document.addEventListener("DOMContentLoaded", () => {

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.role !== "professor") {
        alert("Apenas professores podem criar projetos.");
        window.location.href = "index.html";
        return;
    }
    document.getElementById("nomeUsuario").textContent = usuario.nome;

    const listaProjetos = JSON.parse(localStorage.getItem("projetos") || "[]");
    const profsResponsaveis = [];

    const listaProfs = document.getElementById("listaProfs");

    function renderProfs() {
        listaProfs.innerHTML = "";
        profsResponsaveis.forEach((p, index) => {
            listaProfs.innerHTML += `
                <div class="item-projeto">
                    <div><strong>${p.nome}</strong><br><small>${p.disciplina}</small></div>
                    <button onclick="removerProf(${index})" class="botao-rejeitar">remover</button>
                </div>
            `;
        });
    }

    document.getElementById("btnAddProf").onclick = () => {
        const nome = document.getElementById("profNome").value.trim();
        const disciplina = document.getElementById("profDisciplina").value.trim();
        if (!nome || !disciplina) return;

        profsResponsaveis.push({ nome, disciplina });
        document.getElementById("profNome").value = "";
        document.getElementById("profDisciplina").value = "";
        renderProfs();
    };

    window.removerProf = (i) => {
        profsResponsaveis.splice(i, 1);
        renderProfs();
    };

    document.getElementById("btnSalvarProjeto").onclick = () => {

        const novoProjeto = {
            id: Date.now(),
            titulo: document.getElementById("tituloProjeto").value,
            tematica: document.getElementById("tematicaProjeto").value,
            descricao: document.getElementById("descricaoProjeto").value,
            curso: document.getElementById("cursoProjeto").value,
            status: "aberto",
            etapas: [],
            iniciativas: [],
            participantes: [],
            profsResponsaveis: profsResponsaveis
        };

        if (!novoProjeto.titulo || !novoProjeto.tematica || !novoProjeto.descricao) {
            alert("Preencha título, temática e descrição.");
            return;
        }

        listaProjetos.push(novoProjeto);
        localStorage.setItem("projetos", JSON.stringify(listaProjetos));

        alert("Projeto criado com sucesso!");
        window.location.href = "projetos.html";

    };
});
