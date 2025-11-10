document.addEventListener('DOMContentLoaded', () => {

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || usuario.role !== "professor") {
    alert("Apenas professores podem validar evidências.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuario").textContent = usuario.nome;

  let projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  let evidenciasPendentes = [];

  projetos.forEach(p => {
    (p.evidencias || []).forEach(ev => {
      if (ev.status === "pendente") {
        evidenciasPendentes.push({ projeto: p, evidencia: ev });
      }
    });
  });

  const lista = document.getElementById("listaValidar");
  lista.innerHTML = "";

  evidenciasPendentes.forEach(obj => {
    const { projeto, evidencia } = obj;

    const card = document.createElement("div");
    card.className = "card_n_hov";
    card.style.padding = "15px";

    const isImage = evidencia.arquivoBase64.startsWith("data:image/");

    card.innerHTML = `
      <h3>${projeto.titulo}</h3>
      <p><strong>Aluno:</strong> ${evidencia.alunoNome}</p>
      ${isImage ? `<img src="${evidencia.arquivoBase64}" style="max-width:180px;border-radius:8px; margin:8px 0;">`
               : `<a href="${evidencia.arquivoBase64}" target="_blank">Abrir Arquivo</a>`}

      ${evidencia.comentario ? `<p><em>"${evidencia.comentario}"</em></p>` : ""}

      <textarea id="feedback_${evidencia.id}" placeholder="Comentário do professor (opcional)" rows="2"></textarea>

      <button onclick="validar(${projeto.id}, ${evidencia.id}, true)" class="botao-primario" style="margin-top:10px;">Aprovar</button>
      <button onclick="validar(${projeto.id}, ${evidencia.id}, false)" class="botao-rejeitar">Rejeitar</button>
    `;

    lista.appendChild(card);
  });

});


function validar(idProjeto, idEvidencia, aprovado) {

  let projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const projeto = projetos.find(p => p.id == idProjeto);
  const evidencia = projeto.evidencias.find(e => e.id == idEvidencia);

  const feedback = document.getElementById(`feedback_${idEvidencia}`).value.trim();

  evidencia.status = aprovado ? "aprovado" : "rejeitado";
  evidencia.feedbackProfessor = feedback;

  localStorage.setItem("projetos", JSON.stringify(projetos));

  alert("Evidência atualizada!");
  location.reload();
}
