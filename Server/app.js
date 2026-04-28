import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

// Routers
import donorRouter from './router/donor.router.js';
import contactRouter from './router/contact.router.js';
import hospitalRouter from './router/hospital.router.js'; // ✅ Import hospital router

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(cors());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// Application level middleware
app.use("/donor", donorRouter);
app.use("/contact", contactRouter);
app.use("/hospital", hospitalRouter); // ✅ Add hospital path

// Start server
app.listen(3001, () => {
  console.log("Server running at http://localhost:3001");
});
