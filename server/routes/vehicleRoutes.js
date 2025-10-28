import express from 'express';
import {
  getVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All vehicle routes are protected
router.route('/').get(protect, getVehicles).post(protect, createVehicle);
router.route('/:id').get(protect, getVehicleById).put(protect, updateVehicle).delete(protect, deleteVehicle);

export default router;
