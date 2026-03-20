const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta básica
app.get("/", (req, res) => {
  res.send("Servidor en linea");
});

// Login 
app.post("/login", (req, res) => {
  const correo = req.body.correo;
  const password = req.body.password;

  if (!correo || !password) {
    return res.send("Faltan datos");
  }

  if (correo === "admin@test.com" && password === "123456") {
    return res.send("Login correcto");
  } else {
    return res.send("Credenciales incorrectas");
  }
});

// Levantar servidor
app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto " + PORT);
});