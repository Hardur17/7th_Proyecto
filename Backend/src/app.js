const express = require('express');
const cors = require('cors');
require('dotenv').config();

const verificarToken = require('./middleware/auth.middleware');
const verificarAdmin = require('./middleware/admin.middleware');

const pool = require('./db');

const authRoutes = require('./routes/auth.routes');
const eventosRoutes = require('./routes/eventos.routes');
const inscripcionesRoutes = require('./routes/inscripciones.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);

const PORT = process.env.PORT || 3000;

// Ruta de prueba del servidor
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Servidor en línea'
    });
});

// Ruta protegida para cualquier usuario logueado
app.get('/api/protegida', verificarToken, (req, res) => {
    res.json({
        mensaje: 'Acceso permitido',
        usuario: req.usuario
    });
});

// Ruta protegida solo para admin
app.get('/api/admin', verificarToken, verificarAdmin, (req, res) => {
    res.json({
        mensaje: 'Acceso permitido solo para admin',
        usuario: req.usuario
    });
});

// Ruta para probar conexión con MySQL
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS resultado');

        res.json({
            mensaje: 'Conexión exitosa con MySQL',
            resultado: rows[0].resultado
        });
    } catch (error) {
        console.error('Error conectando a MySQL:', error);

        res.status(500).json({
            mensaje: 'Error conectando a la base de datos',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});