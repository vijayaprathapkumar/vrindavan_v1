"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryById = exports.updateCategoryById = exports.getCategoryById = exports.createCategory = exports.getAllCategories = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all categories
const getAllCategories = async () => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM Categories");
    return rows;
};
exports.getAllCategories = getAllCategories;
// Create a new category
const createCategory = async (name, description, weightage, image) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO Categories (Name, Description, Weightage, Image) VALUES (?, ?, ?, ?)", [name, description, weightage, image]);
};
exports.createCategory = createCategory;
// Fetch category by ID
const getCategoryById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM Categories WHERE CategoryID = ?", [id]);
    return rows;
};
exports.getCategoryById = getCategoryById;
// Update category by ID
const updateCategoryById = async (id, name, description, weightage, image) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE Categories SET Name = ?, Description = ?, Weightage = ?, Image = ? WHERE CategoryID = ?", [name, description, weightage, image, id]);
};
exports.updateCategoryById = updateCategoryById;
// Delete category by ID
const deleteCategoryById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM Categories WHERE CategoryID = ?", [id]);
};
exports.deleteCategoryById = deleteCategoryById;
