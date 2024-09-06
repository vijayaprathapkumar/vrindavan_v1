"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrand = exports.getAllBrands = void 0;
const databaseConnection_1 = require("../config/databaseConnection");
const getAllBrands = async () => {
    const [rows] = await databaseConnection_1.db.promise().query('SELECT * FROM ProductBrands');
    return rows;
};
exports.getAllBrands = getAllBrands;
const createBrand = async (name) => {
    await databaseConnection_1.db.promise().query('INSERT INTO ProductBrands (Name, Active) VALUES (?, TRUE)', [name]);
};
exports.createBrand = createBrand;
