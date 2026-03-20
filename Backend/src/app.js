const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta básica
app.get("/", (req, res) => {
  res.send("Servidor en línea");
});

// Login 
app.post("/login", (req, res) => {
  const correo = req.body.correo;
  const password = req.body.password;

  if (!correo || !password) {
    return res.send("Completa los campos para ingresar");
  }

  if (correo === "test@mail.com" && password === "123456") {
    return res.send("Login correcto");
  } else {
    return res.send("Correo o contraseña incorrectos");
  }
});

// prende server
app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto " + PORT);
});