<?php
require_once "../db.php";

header("Content-Type: application/json");

// --- Dados enviados por POST ---
$projeto_id   = $_POST["projeto_id"] ?? null;
$aluno_id     = $_POST["aluno_id"] ?? null;
$comentario   = $_POST["comentario"] ?? "";
$iniciativa   = $_POST["iniciativa"] ?? "";

// : validar campos obrigatórios

// Criar evidência
$sql = "INSERT INTO evidencias 
        (projeto_id, aluno_id, comentario, iniciativa, status, dataEnvio)
        VALUES (:projeto_id, :aluno_id, :comentario, :iniciativa, 'pendente', NOW())";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ":projeto_id" => $projeto_id,
    ":aluno_id" => $aluno_id,
    ":comentario" => $comentario,
    ":iniciativa" => $iniciativa     // confirmar nome final da coluna
]);

$evidencia_id = $pdo->lastInsertId();

// arquivos enviados
$uploadDir = "../../uploads/evidencias/";
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

foreach ($_FILES["arquivos"]["tmp_name"] as $i => $tmp) {
    
    $nomeOriginal = $_FILES["arquivos"]["name"][$i];
    $tipo = $_FILES["arquivos"]["type"][$i];

    $novoNome = uniqid() . "_" . basename($nomeOriginal);
    move_uploaded_file($tmp, $uploadDir . $novoNome);

    // Inserir info no banco
    $sql2 = "INSERT INTO evidencia_arquivos
            (evidencia_id, nomeOriginal, tipoMIME, caminhoArquivo)
            VALUES (:eid, :nomeOriginal, :tipo, :caminho)";

    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([
        ":eid" => $evidencia_id,
        ":nomeOriginal" => $nomeOriginal,
        ":tipo" => $tipo,
        ":caminho" => $novoNome
    ]);
}

echo json_encode(["sucesso" => true]);


//IMPORTANTE!!!
//vou explicar +/- oq tem q ser feito
//no JS vai ter algo tipo 'Promise.all(arquivos.map(...))'
// essa parte vcs tem q alterar pra algo tipo:

// const formData = new FormData();
// formData.append("projeto_id", idProjeto);
// formData.append("aluno_id", usuario.id);
// formData.append("comentario", comentarioAluno.value);
// formData.append("iniciativa", iniciativaSelecionada);

// arquivos.forEach(arq => {
//     formData.append("arquivos[]", arq);
// });

// fetch("backend/evidencias/enviar_evidencia.php", {
//     method: "POST",
//     body: formData
// })
// .then(r => r.json())
// .then(res => {
//     if (res.sucesso) {
//         alert("Evidência enviada!");
//         window.location.href = "aluno_evidencias.html";
//     }
// });

