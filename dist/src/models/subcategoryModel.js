"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubcategoryById = exports.createSubcategory = exports.getAllSubcategories = void 0;
const databaseConnection_1 = require("../config/databaseConnection");
const getAllSubcategories = async () => {
    const [rows] = await databaseConnection_1.db.promise().query('SELECT * FROM Subcategories');
    return rows;
};
exports.getAllSubcategories = getAllSubcategories;
const createSubcategory = async (name, categoryID, description, weightage, image) => {
    await databaseConnection_1.db.promise().query('INSERT INTO Subcategories (Name, CategoryID, Description, Weightage, Image) VALUES (?, ?, ?, ?, ?)', [name, categoryID, description, weightage, image]);
};
exports.createSubcategory = createSubcategory;
const getSubcategoryById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query('SELECT * FROM Subcategories WHERE SubcategoryID = ?', [id]);
    return rows;
};
exports.getSubcategoryById = getSubcategoryById;
