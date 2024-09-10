import express from "express";
import dotenv from "dotenv";
import routes from "./src/routes";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to our vrindavan");
});

app.use("/api", routes);

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
