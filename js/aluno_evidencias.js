document.addEventListener('DOMContentLoaded', () => {

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || usuario.role !== "aluno") {
    alert("Apenas alunos podem ver suas evidências.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuario").textContent = usuario.nome;

  let projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const lista = document.getElementById("listaEvidencias");
  lista.innerHTML = "";

  let evidenciasAluno = [];

  projetos.forEach(p => {
    (p.evidencias || []).forEach(ev => {
      if (ev.alunoNome === usuario.nome) {
        evidenciasAluno.push({ projeto: p.titulo, evidencia: ev });
      }
    });
  });

  if (evidenciasAluno.length === 0) {
    lista.innerHTML = `<p style="opacity:.7; margin-top:20px;">Você ainda não enviou nenhuma evidência.</p>`;
    return;
  }

  evidenciasAluno.forEach(obj => {
    const { projeto, evidencia } = obj;

    const card = document.createElement("div");
    card.className = "card_n_hov";
    card.style.padding = "15px";

    const isImage = evidencia.arquivoBase64.startsWith("data:image/");

    card.innerHTML = `
      <h3>${projeto}</h3>

      <p><strong>Status:</strong> 
        ${evidencia.status === "pendente" ? "⏳ Aguardando validação" :
        evidencia.status === "aprovado" ? "✅ Aprovado" :
          "❌ Rejeitado"}
      </p>

      ${isImage
        ? `<img src="${evidencia.arquivoBase64}" style="max-width:180px;border-radius:8px;margin:8px 0;">`
        : `<a href="${evidencia.arquivoBase64}" target="_blank"><strong>Abrir Arquivo</strong></a>`}

      ${evidencia.comentario ? `<p><strong>Comentário enviado:</strong> ${evidencia.comentario}</p>` : ""}

      ${evidencia.feedbackProfessor ? `<p><strong>Feedback do professor:</strong> ${evidencia.feedbackProfessor}</p>` : ""}
    `;

    lista.appendChild(card);
  });

});
