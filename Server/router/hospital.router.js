import express from 'express';
const router = express.Router();

// Link hospital controller
import * as hospitalController from '../controller/hospital.controller.js';

// Hospital routes similar to donor routes
router.post("/register", hospitalController.save);       // Register hospital
router.get("/fetch", hospitalController.fetch);          // Fetch hospitals
router.patch("/update", hospitalController.update);      // Update hospital
router.delete("/delete", hospitalController.deleteHospital); // Delete hospital
router.post("/login", hospitalController.login);         // Login hospital
router.get("/nearby/:city", hospitalController.fetchNearbyHospitals);

export default router;
