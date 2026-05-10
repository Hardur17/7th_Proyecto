const express = require('express');
const bcrypt = require('bcrypt');

const pool = require('../db');

const router = express.Router();

// Registro de usuarios
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, correo, password } = req.body;

        if (!nombre || !apellido || !correo || !password) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        const [usuarioExistente] = await pool.query(
            'SELECT id_usuario FROM usuarios WHERE correo = ?',
            [correo]
        );

        if (usuarioExistente.length > 0) {
            return res.status(409).json({
                mensaje: 'El correo ya está registrado'
            });
        }

        const passwordEncriptada = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO usuarios 
            (nombre, apellido, correo, password, rol) 
            VALUES (?, ?, ?, ?, ?)`,
            [nombre, apellido, correo, passwordEncriptada, 'usuario']
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente'
        });

    } catch (error) {
        console.error('Error en registro:', error);

        res.status(500).json({
            mensaje: 'Error al registrar usuario',
            error: error.message
        });
    }
});

module.exports = router;