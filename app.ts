import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./src/routes";
import { initializeCronJobs } from "./src/cron-jobs";
import { razorpayWebhookHandler } from "./src/controllers/razorpayWebhook/razorpayWebhook";
import webhooks from "./src/routes/webhooks/webhooks";

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
  res.send("Welcome to our vrindavan application");
});

app.use("/api", routes);
app.use('/api', webhooks);

const hostname = '0.0.0.0'; // Listen on all IP addresses
const port = 3000; 

app.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});
