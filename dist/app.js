"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./src/routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const corsOptions = {
    origin: '*',
    Credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.get("/", (req, res) => {
    res.send("Welcome to our vrindavan");
});
app.use("/api", routes_1.default);
const hostname = '0.0.0.0'; // Listen on all IP addresses
const port = 3000;
app.listen(port, hostname, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
});
