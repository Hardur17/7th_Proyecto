const express = require('express');
const pool = require('../db');

const verificarToken = require('../middleware/auth.middleware');
const verificarAdmin = require('../middleware/admin.middleware');

const router = express.Router();

// Listar todos los eventos activos
router.get('/', async (req, res) => {
    try {
        const [eventos] = await pool.query(
            'SELECT * FROM eventos WHERE estado = ? ORDER BY fecha_inicio ASC',
            ['activo']
        );

        res.json(eventos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener eventos',
            error: error.message
        });
    }
});

// Crear evento - solo admin
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            lugar,
            cupos,
            imagen
        } = req.body;

        if (!titulo || !descripcion || !fecha_inicio || !fecha_fin || !lugar || !cupos) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios'
            });
        }

        await pool.query(
            `INSERT INTO eventos 
            (titulo, descripcion, fecha_inicio, fecha_fin, lugar, cupos, imagen, creado_por) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                titulo,
                descripcion,
                fecha_inicio,
                fecha_fin,
                lugar,
                cupos,
                imagen || null,
                req.usuario.id_usuario
            ]
        );

        res.status(201).json({
            mensaje: 'Evento creado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear evento',
            error: error.message
        });
    }
});

// Cancelar evento - solo admin
router.put('/:id/cancelar', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            'UPDATE eventos SET estado = ? WHERE id_evento = ?',
            ['cancelado', id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Evento no encontrado'
            });
        }

        res.json({
            mensaje: 'Evento cancelado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al cancelar evento',
            error: error.message
        });
    }
});

module.exports = router;