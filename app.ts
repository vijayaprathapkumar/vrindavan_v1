import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./src/routes";

dotenv.config();

const app = express();

app.use(express.json());

const corsOptions = {
  origin: '*',
  Credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.get("/", (req, res) => {
  res.send("Welcome to our vrindavan");
});

app.use("/api", routes);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
