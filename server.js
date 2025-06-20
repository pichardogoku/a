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
    res.status(500).send("❌ Error al actualizar: " + err);
  }
});

