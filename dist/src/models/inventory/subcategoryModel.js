"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubcategoryById = exports.updateSubcategoryById = exports.getSubcategoryById = exports.createSubcategory = exports.getAllSubcategories = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getAllSubcategories = async () => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM Subcategories");
    return rows;
};
exports.getAllSubcategories = getAllSubcategories;
const createSubcategory = async (name, categoryID, description, weightage, image) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO Subcategories (Name, CategoryID, Description, Weightage, Image) VALUES (?, ?, ?, ?, ?)", [name, categoryID, description, weightage, image]);
};
exports.createSubcategory = createSubcategory;
const getSubcategoryById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM Subcategories WHERE SubcategoryID = ?", [id]);
    return rows;
};
exports.getSubcategoryById = getSubcategoryById;
const updateSubcategoryById = async (id, name, categoryID, description, weightage, image) => {
    const [result] = await databaseConnection_1.db
        .promise()
        .query("UPDATE Subcategories SET Name = ?, CategoryID = ?, Description = ?, Weightage = ?, Image = ? WHERE SubcategoryID = ?", [name, categoryID, description, weightage, image, id]);
    return result;
};
exports.updateSubcategoryById = updateSubcategoryById;
const deleteSubcategoryById = async (id) => {
    const [result] = await databaseConnection_1.db
        .promise()
        .query("DELETE FROM Subcategories WHERE SubcategoryID = ?", [id]);
    return result;
};
exports.deleteSubcategoryById = deleteSubcategoryById;
