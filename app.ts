import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./src/routes";
import { initializeCronJobs } from "./src/cron-jobs";
import webhooks from "./src/routes/webhooks/webhooks";

dotenv.config();

const app = express();

app.use(
  "/api/razorpay/webhook",
  webhooks 
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const corsOptions = {
  origin: '*',
  Credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

initializeCronJobs();

app.get("/", (req, res) => {
  res.send("Welcome to our vrindavan application");
});

app.use("/api", routes);


const hostname = '0.0.0.0'; // Listen on all IP addresses
const port = 3000; 

app.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});
