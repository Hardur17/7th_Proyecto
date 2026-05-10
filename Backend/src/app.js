const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const eventosRoutes = require('./routes/eventos.routes');
const inscripcionesRoutes = require('./routes/inscripciones.routes');
const certificadosRoutes = require('./routes/certificados.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/certificados', certificadosRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de Gestión de Eventos funcionando'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});