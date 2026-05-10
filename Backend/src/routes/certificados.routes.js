const express = require('express');
const path = require('path');
const pool = require('../db');

const generarCertificadoPDF = require('../utils/generarCertificado');

const verificarToken = require('../middleware/auth.middleware');

const router = express.Router();

// Generar certificado
router.post('/:id_evento', verificarToken, async (req, res) => {
    try {
        const { id_evento } = req.params;
        const id_usuario = req.usuario.id_usuario;

        const [datos] = await pool.query(
            `SELECT 
                i.id_inscripcion,
                i.estado AS estado_inscripcion,
                i.asistencia,
                e.titulo AS titulo_evento,
                e.fecha_inicio,
                e.lugar,
                e.estado AS estado_evento,
                u.nombre,
                u.apellido
            FROM inscripciones i
            INNER JOIN eventos e ON i.id_evento = e.id_evento
            INNER JOIN usuarios u ON i.id_usuario = u.id_usuario
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

        const fechaEvento = new Date(inscripcion.fecha_inicio).toLocaleDateString();
        const fechaGeneracion = new Date().toLocaleDateString();

        const pdf = await generarCertificadoPDF({
            nombre: inscripcion.nombre,
            apellido: inscripcion.apellido,
            titulo_evento: inscripcion.titulo_evento,
            fecha_evento: fechaEvento,
            lugar: inscripcion.lugar,
            codigo_certificado: codigo,
            fecha_generacion: fechaGeneracion
        });

        const urlCertificado = `/api/certificados/descargar/${pdf.nombreArchivo}`;

        await pool.query(
            `INSERT INTO certificados 
            (id_usuario, id_evento, codigo_certificado, url_certificado)
            VALUES (?, ?, ?, ?)`,
            [id_usuario, id_evento, codigo, urlCertificado]
        );

        res.status(201).json({
            mensaje: 'Certificado generado correctamente',
            codigo_certificado: codigo,
            url_certificado: urlCertificado
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al generar certificado',
            error: error.message
        });
    }
});

// Descargar certificado
router.get('/descargar/:archivo', verificarToken, (req, res) => {
    const { archivo } = req.params;

    const rutaArchivo = path.join(__dirname, '../../certificados', archivo);

    res.download(rutaArchivo);
});

module.exports = router;