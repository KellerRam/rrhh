// Importar dependencias
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors'); // ← Agregar esta línea

// Cargar variables de entorno
dotenv.config();

// Configurar CORS - AGREGAR ESTO
app.use(cors({
  origin: 'http://localhost:3000', // URL de tu frontend React
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

// Importar rutas modularizadas
const empleadosRoutes = require('./routes/empleados');
const sucursalesRoutes = require('./routes/sucursales');

// Usar las rutas
app.use("/api/empleado", empleadosRoutes);
app.use("/api/sucursal", sucursalesRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ mensaje: "API funcionando correctamente" });
});

// Escuchar en puerto
app.listen(8800, () => {
    console.log('Servidor listo, PID=' + process.pid);
});