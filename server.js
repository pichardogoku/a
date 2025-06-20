// server.js completo básico para tu proyecto PAEC - Pichardo

import express from "express";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Para que funcione __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para leer json y form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (html, css, js del cliente)
app.use(express.static(path.join(__dirname, "public")));

// Conexion MongoDB Atlas
const uri = process.env.MONGO_URI;  // pon en Render el MONGO_URI con tu conexión
const client = new MongoClient(uri);

let collection;

async function conectarMongo() {
  try {
    await client.connect();
    const db = client.db("paecpichardo");
    collection = db.collection("reportes");
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (err) {
    console.error("Error al conectar MongoDB:", err);
  }
}
conectarMongo();

// Rutas API (alta, baja, actualizar, visualizar)

// Alta
app.post("/alta", async (req, res) => {
  try {
    await collection.insertOne(req.body);
    res.redirect("/index.html");
  } catch (err) {
    res.status(500).send("Error al dar de alta: " + err);
  }
});

// Baja
app.post("/baja", async (req, res) => {
  try {
    const resultado = await collection.deleteOne({ id_reporte: req.body.id_reporte });
    if (resultado.deletedCount === 0) {
      res.send("No se encontró el reporte para eliminar.");
    } else {
      res.redirect("/index.html");
    }
  } catch (err) {
    res.status(500).send("Error al dar de baja: " + err);
  }
});

// Actualizar
app.post("/actualizar", async (req, res) => {
  try {
    const idReporte = req.body.id_reporte;

    const camposActualizados = {};
    const campos = ['salon_area', 'problema', 'descripcion', 'fecha_reporte', 'prioridad', 'estado'];
    campos.forEach(campo => {
      if (req.body[campo] && req.body[campo].trim() !== '') {
        camposActualizados[campo] = req.body[campo];
      }
    });

    if (Object.keys(camposActualizados).length === 0) {
      return res.send("No seleccionaste ningún campo para actualizar.");
    }

    const resultado = await collection.updateOne(
      { id_reporte: idReporte },
      { $set: camposActualizados }
    );

    if (resultado.matchedCount === 0) {
      res.send("No se encontró el reporte para actualizar.");
    } else {
      res.redirect("/index.html");
    }
  } catch (err) {
    res.status(500).send("Error al actualizar: " + err);
  }
});

// Visualizar (API que retorna JSON con todos los reportes)
app.get("/api/reportes", async (req, res) => {
  try {
    const reportes = await collection.find({}).toArray();
    res.json(reportes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener reportes" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

