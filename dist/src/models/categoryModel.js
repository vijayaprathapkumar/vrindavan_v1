"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryById = exports.createCategory = exports.getAllCategories = void 0;
const databaseConnection_1 = require("../config/databaseConnection");
const getAllCategories = async () => {
    const [rows] = await databaseConnection_1.db.promise().query('SELECT * FROM Categories');
    return rows;
};
exports.getAllCategories = getAllCategories;
const createCategory = async (name, description, weightage, image) => {
    await databaseConnection_1.db.promise().query('INSERT INTO Categories (Name, Description, Weightage, Image) VALUES (?, ?, ?, ?)', [name, description, weightage, image]);
};
exports.createCategory = createCategory;
const getCategoryById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query('SELECT * FROM Categories WHERE CategoryID = ?', [id]);
    return rows;
};
exports.getCategoryById = getCategoryById;
