const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
});

// Devolver todas las sucursales
router.get("/", (req, res) => {
    console.log("Entrando a /api/sucursal", req.query);
    connection.query('SELECT * FROM sucursal', (error, rows) => {
        if (error) {
            console.error('Error consultando sucursales:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        return res.status(200).json(rows);
    });
});

// Crear sucursal
router.post("/", (req, res) => {
    const datos = req.body;
    connection.query('INSERT INTO sucursal SET ?', datos, function(error, rows) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json("Sucursal creada");
        }
    });
});

// Actualizar sucursal
router.put("/:id", (req, res) => {
    const id = req.params.id;
    const datos = req.body;
    connection.query('UPDATE sucursal SET ? WHERE idsucursal = ?', [datos, id], function(error, rows) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json("Sucursal actualizada");
        }
    });
});

// Borrar sucursal
router.delete("/:id", (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM sucursal WHERE idsucursal = ?', [id], function(error, rows) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json("Sucursal eliminada");
        }
    });
});

// Devolver sucursal por id
router.get("/:id", (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM sucursal WHERE idsucursal = ?', [id], function(error, rows) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json(rows);
        }
    });
});

module.exports = router;