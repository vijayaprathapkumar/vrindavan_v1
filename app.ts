import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./src/routes";
import { initializeCronJobs } from "./src/cron-jobs";

dotenv.config();

const app = express();

app.use(express.json());

const corsOptions = {
  origin: '*',
  Credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

initializeCronJobs();

app.get("/", (req, res) => {
  res.send("Welcome to our vrindavan");
});

app.use("/api", routes);

const hostname = '0.0.0.0'; // Listen on all IP addresses
const port = 3000; 

app.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});