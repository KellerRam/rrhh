const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
});

// Mostrar la cantidad de empleados
router.get("/conteo", (req, res) => {
    console.log("Entrando a /api/empleado/count");
    connection.query('SELECT COUNT(*) AS total FROM empleado', (error, results) => {
        if (error) {
            console.error('Error ejecutando la consulta:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        const total = results[0].total;
        console.log("Total obtenido:", total);
        return res.status(200).json({ total });
    });
});

// Devolver todos los empleados
router.get("/", (req, res) => {
    console.log("Entrando a /api/empleado", req.query);
    connection.query('SELECT * FROM empleado', (error, rows) => {
        if (error) {
            console.error('Error consultando empleados:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        return res.status(200).json(rows);
    });
});

// Devolver empleado por id
router.get("/:id", (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM empleado WHERE idempleado = ?', [id], function(error, rows) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json(rows);
        }
    });
});

// Crear empleado
router.post("/", (req, res) => {
    const datos = req.body;
    connection.query('INSERT INTO empleado SET ?', datos, function(error, rows) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json("Empleado creado");
        }
    });
});

// Borrar empleado
router.delete("/:id", (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM empleado WHERE idempleado = ?', [id], function(error, rows) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json("Empleado eliminado");
        }
    });
});

// Actualizar empleado
router.put("/:id", (req, res) => {
    const id = req.params.id;
    const datos = req.body;
    connection.query('UPDATE empleado SET ? WHERE idempleado = ?', [datos, id], function(error, rows) {
        if (error) {
            res.status(500).json(error);
        } else {
            res.status(200).json("Empleado actualizado");
        }
    });
});

// Calcular nómina
router.put("/salario/:id", (req, res) => {
    const id = req.params.id;
    const datos = req.body;
    const bonos = datos.bonos || 0;
    const descuentos = datos.descuentos || 0;
    
    connection.query('SELECT salario_base FROM empleado WHERE idempleado = ?', [id], function(error, rows) {
        if (error) {
            return res.status(500).json(error);
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        
        const salario_base = rows[0].salario_base;
        const salario_neto = salario_base + bonos - descuentos;
        
        connection.query('UPDATE empleado SET salario_base = ? WHERE idempleado = ?', [salario_neto, id], function(error, rows) {
            if (error) {
                return res.status(500).json(error);
            } else {
                return res.status(200).json({ 
                    mensaje: "Empleado actualizado", 
                    salario_anterior: salario_base, 
                    bonos: bonos, 
                    descuentos: descuentos, 
                    salario_neto: salario_neto 
                });
            }
        });
    });
});

// Calcular comisiones por venta
router.put("/comision/:id", (req, res) => {
    const id = req.params.id;
    const datos = req.body;
    const venta_mensual = datos.venta_mensual || 0;
    
    connection.query('SELECT salario_base FROM empleado WHERE idempleado = ?', [id], function(error, rows) {
        if (error) {
            return res.status(500).json(error);
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        
        const salario_base = rows[0].salario_base;
        const comisiones = salario_base * 0.05 + venta_mensual * 0.05;
        const salario_con_comision = salario_base + comisiones;
        
        connection.query('UPDATE empleado SET salario_base = ? WHERE idempleado = ?', [salario_con_comision, id], function(error, rows) {
            if (error) {
                return res.status(500).json(error);
            } else {
                return res.status(200).json({ 
                    mensaje: "Empleado actualizado", 
                    salario_anterior: salario_base, 
                    comisiones: comisiones, 
                    salario_nuevo: salario_con_comision 
                });
            }
        });
    });
});

// Devolver todos los empleados con nombre de sucursal
router.get("/empleadosucursal", (req, res) => {
    const query = req.query || {};
    console.log("Entrando a /api/empleado/empleadosucursal", query);

    let sql = `SELECT e.*, s.nombre AS sucursal FROM empleado e LEFT JOIN sucursal s ON e.idsucursal = s.idsucursal`;
    const params = [];
    
    if (query.id) {
        sql += ' WHERE e.idsucursal = ?';
        params.push(query.id);
        console.log(`Buscando empleados de sucursal ID: ${query.id}`);
    }

    console.log('SQL:', sql);
    console.log('Params:', params);

    connection.query(sql, params, (error, rows) => {
        if (error) {
            console.error('Error consultando empleados por sucursal:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        console.log(`Empleados encontrados: ${rows.length}`);
        return res.status(200).json(rows);
    });
});

module.exports = router;