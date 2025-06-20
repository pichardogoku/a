// server.js
import express from "express";
import { MongoClient } from "mongodb";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos desde /public
app.use(express.static(path.join(path.resolve(), "public")));

// Conexión a MongoDB Atlas
const uri = process.env.MONGODB_URI || "mongodb+srv://pichardogoku:777@cluster0.pygx8wu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);
let collection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("paecpichardo");
    collection = db.collection("reportes");
    console.log("Conectado a MongoDB");
  } catch (err) {
    console.error("Error conectando a MongoDB:", err);
  }
}

connectDB();

// Rutas

// Alta
app.post("/alta", async (req, res) => {
  try {
    const nuevoReporte = {
      id_reporte: req.body.id_reporte,
      salon_area: req.body.salon_area,
      problema: req.body.problema,
      descripcion: req.body.descripcion,
      fecha_reporte: req.body.fecha_reporte,
      prioridad: req.body.prioridad,
      estado: req.body.estado,
    };
    await collection.insertOne(nuevoReporte);
    res.redirect("/index.html");
  } catch (err) {
    res.status(500).send("Error al dar de alta: " + err);
  }
});

// Baja
app.post("/baja", async (req, res) => {
  try {
    const idReporte = req.body.id_reporte;
    const resultado = await collection.deleteOne({ id_reporte: idReporte });
    if (resultado.deletedCount === 0) {
      res.send("No se encontró el reporte para eliminar.");
    } else {
      res.redirect("/index.html");
    }
  } catch (err) {
    res.status(500).send("Error al eliminar: " + err);
  }
});

// Actualizar
app.post("/actualizar", async (req, res) => {
  try {
    const idReporte = req.body.id_reporte;
    const datosActualizar = {
      salon_area: req.body.salon_area,
      problema: req.body.problema,
      descripcion: req.body.descripcion,
      fecha_reporte: req.body.fecha_reporte,
      prioridad: req.body.prioridad,
      estado: req.body.estado,
    };
    const resultado = await collection.updateOne(
      { id_reporte: idReporte },
      { $set: datosActualizar }
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

// Obtener reportes en JSON para visualizar.html
app.get("/api/reportes", async (req, res) => {
  try {
    const reportes = await collection.find({}).toArray();
    res.json(reportes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener reportes" });
  }
});

// Ruta raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
