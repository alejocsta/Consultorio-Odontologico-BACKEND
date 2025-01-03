// controllers/citaController.js
const citaService = require('../logic/citaLogic');
const citaSchema = require('../models/cita/citaSchema');
// Crear una cita
async function crearCita(req, res) {
  try {
    const nuevaCita = await citaService.crearCita(req.body);
    res.status(201).json(nuevaCita);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Obtener todas las citas
async function obtenerCitas(req, res) {
  try {
    const citas = await citaService.obtenerCitas();
    res.status(200).json(citas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Obtener una cita por ID
async function obtenerCitaPorId(req, res) {
  try {
    const cita = await citaService.obtenerCitaPorId(req.params.id);
    if (cita) {
      res.status(200).json(cita);
    } else {
      res.status(404).json({ message: 'Cita no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Actualizar una cita
async function actualizarCita(req, res) {
  try {
    const citaActualizada = await citaService.actualizarCita(req.params.id, req.body);
    if (citaActualizada) {
      res.status(200).json(citaActualizada);
    } else {
      res.status(404).json({ message: 'Cita no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Eliminar una cita
async function eliminarCita(req, res) {
  try {
    const citaEliminada = await citaService.eliminarCita(req.params.id);
    if (citaEliminada) {
      res.status(200).json({ message: 'Cita eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Cita no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// Obtener citas por mes y año
async function obtenerCitasPorMes(req, res) {
  try {
    const { mes, año } = req.query;

    if (!mes || !año) {
      return res.status(400).json({ message: 'Se requiere el mes y el año en los parámetros' });
    }

    // Crear el rango de fechas para el mes
    const fechaInicio = new Date(año, mes - 1, 1); // Mes es base 0 en JavaScript
    const fechaFin = new Date(año, mes, 0, 23, 59, 59, 999); // Último día del mes

    // Buscar citas en el rango
    const citas = await citaSchema.find({
      fecha: {
        $gte: fechaInicio,
        $lte: fechaFin
      }
    }).populate('pacienteId', 'nombre').populate('medicoId', 'nombre');

    res.status(200).json(citas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const getCitasHoy = async (req, res) => {
  try {
      // Obtener la fecha actual y establecer las horas a 00:00:00
      const fechaInicio = new Date();
      fechaInicio.setHours(0, 0, 0, 0);

      // Establecer la fecha final a las 23:59:59
      const fechaFin = new Date();
      fechaFin.setHours(23, 59, 59, 999);

      // Buscar citas entre fechaInicio y fechaFin
      const citas = await citaSchema.find({
          fecha: {
              $gte: fechaInicio,
              $lte: fechaFin
          }
      })
      .populate('pacienteId', 'nombre apellido') 
      .populate('medicoId', 'nombre apellido')   
      .sort({ fecha: 1 }); // Ordenar por fecha ascendente

      // Si no hay citas
      if (citas.length === 0) {
          return res.status(200).json({
              mensaje: 'No hay citas programadas para hoy',
              data: []
          });
      }

      // Devolver las citas encontradas
      res.status(200).json({
          mensaje: 'Citas del día recuperadas exitosamente',
          total: citas.length,
          data: citas
      });

  } catch (error) {
      res.status(500).json({
          mensaje: 'Error al obtener las citas del día',
          error: error.message
      });
  }
};

module.exports = {
  crearCita,
  obtenerCitas,
  obtenerCitaPorId,
  actualizarCita,
  eliminarCita,
  obtenerCitasPorMes,
  getCitasHoy,
};
