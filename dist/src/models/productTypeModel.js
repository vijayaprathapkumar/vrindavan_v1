"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductType = exports.getAllProductTypes = void 0;
const databaseConnection_1 = require("../config/databaseConnection");
const getAllProductTypes = async () => {
    const [rows] = await databaseConnection_1.db.promise().query('SELECT * FROM ProductTypes');
    return rows;
};
exports.getAllProductTypes = getAllProductTypes;
const createProductType = async (name, weightage) => {
    await databaseConnection_1.db.promise().query('INSERT INTO ProductTypes (Name, Weightage, Active) VALUES (?, ?, TRUE)', [name, weightage]);
};
exports.createProductType = createProductType;
