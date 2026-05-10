const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Ruta de prueba del servidor
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Servidor en línea'
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