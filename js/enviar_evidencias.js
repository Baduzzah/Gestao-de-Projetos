document.addEventListener("DOMContentLoaded", () => {

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.role !== "aluno") {
        alert("Apenas alunos podem enviar evidências.");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("nomeUsuario").textContent = usuario.nome;

    let projetos = JSON.parse(localStorage.getItem("projetos") || "[]");

    // pega id da URL se existir
    const params = new URLSearchParams(window.location.search);
    let idProjeto = params.get("id");

    const selectProjetoBox = document.getElementById("selectProjetoBox");
    const selectProjeto = document.getElementById("selectProjeto");

    // projetos nos quais o aluno está inscrito
    const projetosAluno = projetos.filter(p =>
        (p.participantes || []).some(a => a.nome === usuario.nome)
    );

    // Se NÃO tiver id → aluno escolhe o projeto
    if (!idProjeto) {
        selectProjetoBox.style.display = "block";

        projetosAluno.forEach(p => {
            selectProjeto.innerHTML += `<option value="${p.id}">${p.titulo}</option>`;
        });

        selectProjeto.onchange = () => {
            idProjeto = selectProjeto.value;
        };
    }

    const inputArquivo = document.getElementById("inputArquivo");
    const preview = document.getElementById("preview");
    const previewImg = document.getElementById("previewImg");
    const previewNome = document.getElementById("previewNome");
    const comentarioAluno = document.getElementById("comentarioAluno");

    inputArquivo.onchange = () => {
        const arquivo = inputArquivo.files[0];
        if (!arquivo) return;

        preview.style.display = "block";
        previewNome.textContent = arquivo.name;

        if (arquivo.type.startsWith("image/")) {
            previewImg.style.display = "block";
            previewImg.src = URL.createObjectURL(arquivo);
        } else {
            previewImg.style.display = "none";
        }
    };

    document.getElementById("btnEnviarEvidencia").onclick = () => {

        if (!idProjeto) {
            alert("Selecione um projeto primeiro!");
            return;
        }

        const arquivo = inputArquivo.files[0];
        if (!arquivo) {
            alert("Selecione um arquivo.");
            return;
        }

        let projeto = projetos.find(p => p.id == idProjeto);

        if (!projeto) {
            alert("Projeto não encontrado.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {

            projeto.evidencias = projeto.evidencias || [];

            projeto.evidencias.push({
                id: Date.now(),
                alunoNome: usuario.nome,
                alunoRa: usuario.ra || "",
                comentario: comentarioAluno.value.trim(),
                arquivoBase64: reader.result,
                status: "pendente",
                feedbackProfessor: ""
            });

            localStorage.setItem("projetos", JSON.stringify(projetos));

            alert("Evidência enviada para validação!");
            window.location.href = "aluno_evidencias.html";
        };

        reader.readAsDataURL(arquivo);
    };

});
