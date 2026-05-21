import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { nombre, apellido, correo, password } = req.body;

        const [usuarioExiste] = await pool.query(
            'SELECT * FROM usuarios WHERE correo = ?',
            [correo]
        );

        if (usuarioExiste.length > 0) {
            return res.status(400).json({
                mensaje: 'El correo ya está registrado'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.query(
            `
            INSERT INTO usuarios(nombre, apellido, correo, password, rol)
            VALUES (?, ?, ?, ?, ?)
            `,
            [nombre, apellido, correo, passwordHash, 'usuario']
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: 'Error al registrar usuario'
        });
    }
};

export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        const [usuarios] = await pool.query(
            'SELECT * FROM usuarios WHERE correo = ?',
            [correo]
        );

        if (usuarios.length === 0) {
            return res.status(400).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        const usuario = usuarios[0];

        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(400).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '8h'
            }
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: 'Error al iniciar sesión'
        });
    }
};

export const actualizarNombre = async (req, res) => {
    try {
        const { nombre, apellido } = req.body;

        const idUsuario = req.usuario.id_usuario;

        if (!nombre || !apellido) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        await pool.query(
            `
            UPDATE usuarios
            SET nombre = ?, apellido = ?
            WHERE id_usuario = ?
            `,
            [nombre, apellido, idUsuario]
        );

        res.json({
            mensaje: 'Nombre actualizado correctamente'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: 'Error al actualizar nombre'
        });
    }
};