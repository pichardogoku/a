// server.js
import express from "express";
import { MongoClient } from "mongodb";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Para rutas relativas con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB URI desde .env o directa
const uri = process.env.MONGODB_URI || "mongodb+srv://pichardogoku:777@cluster0.pygx8wu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let collection;

// Conexión a MongoDB
async function connectDB() {
  try {
    await client.connect();
    const db = client.db("paecpichardo");
    collection = db.collection("reportes");
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err);
  }
}
connectDB();

// RUTAS

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
    res.status(500).send("❌ Error al dar de alta: " + err);
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
    res.status(500).send("❌ Error al eliminar: " + err);
  }
});

// Actualizar
app.post("/actualizar", async (req, res) => {
  try {
    const idReporte = req.body.id_reporte;
    const actualizacion = {
      salon_area: req.body.salon_area,
      problema: req.body.problema,
      descripcion: req.body.descripcion,
      fecha_reporte: req.body.fecha_reporte,
      prioridad: req.body.prioridad,
      estado: req.body.estado,
    };

    const resultado = await collection.updateOne({ id_reporte: idReporte }, { $set: actualizacion });

    if (resultado.matchedCount === 0) {
      res.send("No se encontró el reporte para actualizar.");
    } else {
      res.redirect("/index.html");
    }
  } catch (err) {
    res.status(500).send("❌ Error al actualizar: " + err);
  }
});

// Visualización (JSON)
app.get("/api/reportes", async (req, res) => {
  try {
    const reportes = await collection.find({}).toArray();
    res.json(reportes);
  } catch (err) {
    res.status(500).json({ error: "❌ Error al obtener reportes" });
  }
});

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

