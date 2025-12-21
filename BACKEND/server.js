import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
dotenv.config();

import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

import { notFound, errorHandler } from "./middlewares/errorhandler.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);


// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
