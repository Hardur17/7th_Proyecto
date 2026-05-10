const express = require('express');
const pool = require('../db');

const verificarToken = require('../middleware/auth.middleware');
const verificarAdmin = require('../middleware/admin.middleware');

const router = express.Router();

// Obtener estadísticas generales - solo admin
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const [totalEventos] = await pool.query(
            'SELECT COUNT(*) AS total FROM eventos'
        );

        const [eventosActivos] = await pool.query(
            'SELECT COUNT(*) AS total FROM eventos WHERE estado = ?',
            ['activo']
        );

        const [totalInscripciones] = await pool.query(
            'SELECT COUNT(*) AS total FROM inscripciones'
        );

        const [certificadosGenerados] = await pool.query(
            'SELECT COUNT(*) AS total FROM certificados'
        );

        res.json({
            total_eventos: totalEventos[0].total,
            eventos_activos: eventosActivos[0].total,
            total_inscripciones: totalInscripciones[0].total,
            certificados_generados: certificadosGenerados[0].total
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener estadísticas',
            error: error.message
        });
    }
});

module.exports = router;