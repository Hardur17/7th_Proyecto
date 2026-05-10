const express = require('express');
const pool = require('../db');

const verificarToken = require('../middleware/auth.middleware');

const router = express.Router();

// Generar certificado
router.post('/:id_evento', verificarToken, async (req, res) => {
    try {
        const { id_evento } = req.params;
        const id_usuario = req.usuario.id_usuario;

        // Verificar si el usuario puede recibir certificado
        const [datos] = await pool.query(
            `SELECT 
                i.id_inscripcion,
                i.estado AS estado_inscripcion,
                i.asistencia,
                e.titulo,
                e.estado AS estado_evento
            FROM inscripciones i
            INNER JOIN eventos e ON i.id_evento = e.id_evento
            WHERE i.id_usuario = ? AND i.id_evento = ?`,
            [id_usuario, id_evento]
        );

        if (datos.length === 0) {
            return res.status(404).json({
                mensaje: 'No estás inscrito en este evento'
            });
        }

        const inscripcion = datos[0];

        if (inscripcion.estado_inscripcion !== 'inscrito') {
            return res.status(400).json({
                mensaje: 'La inscripción no está activa'
            });
        }

        if (inscripcion.asistencia !== 'asistio') {
            return res.status(400).json({
                mensaje: 'No puedes generar certificado porque no tienes asistencia registrada'
            });
        }

        if (inscripcion.estado_evento !== 'finalizado') {
            return res.status(400).json({
                mensaje: 'El evento aún no ha finalizado'
            });
        }

        // Verificar si ya existe certificado
        const [certificadoExistente] = await pool.query(
            'SELECT * FROM certificados WHERE id_usuario = ? AND id_evento = ?',
            [id_usuario, id_evento]
        );

        if (certificadoExistente.length > 0) {
            return res.json({
                mensaje: 'Certificado ya generado',
                certificado: certificadoExistente[0]
            });
        }

        const codigo = `CERT-${id_usuario}-${id_evento}-${Date.now()}`;

        await pool.query(
            `INSERT INTO certificados 
            (id_usuario, id_evento, codigo_certificado, url_certificado)
            VALUES (?, ?, ?, ?)`,
            [id_usuario, id_evento, codigo, null]
        );

        res.status(201).json({
            mensaje: 'Certificado generado correctamente',
            codigo_certificado: codigo
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al generar certificado',
            error: error.message
        });
    }
});

module.exports = router;