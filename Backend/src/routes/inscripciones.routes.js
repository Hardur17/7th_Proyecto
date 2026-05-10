const express = require('express');
const pool = require('../db');

const verificarToken = require('../middleware/auth.middleware');
const verificarAdmin = require('../middleware/admin.middleware');

const router = express.Router();

// Inscribirse a un evento
router.post('/:id_evento', verificarToken, async (req, res) => {
    try {
        const { id_evento } = req.params;
        const id_usuario = req.usuario.id_usuario;

        // Verificar si el evento existe y está activo
        const [eventos] = await pool.query(
            'SELECT * FROM eventos WHERE id_evento = ? AND estado = ?',
            [id_evento, 'activo']
        );

        if (eventos.length === 0) {
            return res.status(404).json({
                mensaje: 'Evento no encontrado o no disponible'
            });
        }

        // Verificar si el usuario ya está inscrito
        const [inscripcionExistente] = await pool.query(
            'SELECT * FROM inscripciones WHERE id_usuario = ? AND id_evento = ?',
            [id_usuario, id_evento]
        );

        if (inscripcionExistente.length > 0) {
            return res.status(409).json({
                mensaje: 'Ya estás inscrito en este evento'
            });
        }

        // Crear inscripción
        await pool.query(
            `INSERT INTO inscripciones 
            (id_usuario, id_evento, estado, asistencia) 
            VALUES (?, ?, ?, ?)`,
            [id_usuario, id_evento, 'inscrito', 'pendiente']
        );

        res.status(201).json({
            mensaje: 'Inscripción realizada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al inscribirse al evento',
            error: error.message
        });
    }
});

// Ver mis inscripciones
router.get('/mis-inscripciones', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const [inscripciones] = await pool.query(
            `SELECT 
                i.id_inscripcion,
                i.estado AS estado_inscripcion,
                i.asistencia,
                i.fecha_inscripcion,
                e.id_evento,
                e.titulo,
                e.descripcion,
                e.fecha_inicio,
                e.fecha_fin,
                e.lugar,
                e.estado AS estado_evento
            FROM inscripciones i
            INNER JOIN eventos e ON i.id_evento = e.id_evento
            WHERE i.id_usuario = ?
            ORDER BY i.fecha_inscripcion DESC`,
            [id_usuario]
        );

        res.json(inscripciones);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener inscripciones',
            error: error.message
        });
    }
});

// Cancelar mi inscripción
router.put('/:id_evento/cancelar', verificarToken, async (req, res) => {
    try {
        const { id_evento } = req.params;
        const id_usuario = req.usuario.id_usuario;

        const [resultado] = await pool.query(
            `UPDATE inscripciones 
            SET estado = ? 
            WHERE id_usuario = ? AND id_evento = ?`,
            ['cancelado', id_usuario, id_evento]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Inscripción no encontrada'
            });
        }

        res.json({
            mensaje: 'Inscripción cancelada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al cancelar inscripción',
            error: error.message
        });
    }
});

// Marcar asistencia - solo admin
router.put('/:id_inscripcion/asistencia', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id_inscripcion } = req.params;
        const { asistencia } = req.body;

        if (asistencia !== 'asistio' && asistencia !== 'no_asistio') {
            return res.status(400).json({
                mensaje: 'La asistencia debe ser asistio o no_asistio'
            });
        }

        const [resultado] = await pool.query(
            `UPDATE inscripciones 
            SET asistencia = ? 
            WHERE id_inscripcion = ?`,
            [asistencia, id_inscripcion]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Inscripción no encontrada'
            });
        }

        res.json({
            mensaje: 'Asistencia actualizada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar asistencia',
            error: error.message
        });
    }
});

module.exports = router;