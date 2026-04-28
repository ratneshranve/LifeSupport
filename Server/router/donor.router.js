import express from 'express';
const router = express.Router();
import * as donorController from '../controller/donor.controller.js';
import multer from 'multer';

// Configure multer for report uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/reports/'), 
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Donor routes
router.post("/register", donorController.save);
router.get("/fetch", donorController.fetch);         
router.get("/fetch-all", donorController.fetchAll);  
router.patch("/update", donorController.update);
router.delete("/delete", donorController.deletedonor);
router.post("/login", donorController.login);


router.post("/upload-report/:id", upload.single('report'), donorController.uploadReport);


router.patch("/verify-eligibility/:id", donorController.verifyEligibility);

export default router;
