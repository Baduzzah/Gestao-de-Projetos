<?php

// isso é mais tipo um exemplo, tem q fazer direito e tem q fazer no html


session_start();
header("Content-Type: application/json");
require_once "config.php";

// Recebe dados do JS
$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"] ?? "";
$senha = $data["senha"] ?? "";


$email = trim($email);
$senha = trim($senha);

if ($email === "" || $senha === "") {
    echo json_encode(["success" => false, "message" => "Preencha todos os campos."]);
    exit;
}

$sql = "SELECT * FROM usuarios WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuário inexistente."]);
    exit;
}

$user = $result->fetch_assoc();

// Verifica senha 
if (hash("sha256", $senha) !== $user["senha"]) {
    echo json_encode(["success" => false, "message" => "Senha incorreta."]);
    exit;
}

// sem o sha-256 ficaria tipo: //

// if ($senha !== $user["senha"]) {
//     echo json_encode(["success" => false, "message" => "Senha incorreta."]);
//     exit;
// }
//se for usar a criptografia msm tem q pedir pra Any mudar o bd (eu acho)



// Guarda dados na sessão
$_SESSION["usuario"] = [
    "id" => $user["id"],
    "nome" => $user["nome"],
    "email" => $user["email"],
    "role" => $user["role"],
    "ra" => $user["ra"]
];

echo json_encode([
    "success" => true,
    "message" => "Login realizado com sucesso!",
    "usuario" => $_SESSION["usuario"]
]);
?>
