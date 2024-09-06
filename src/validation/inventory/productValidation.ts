import { body, param, validationResult } from 'express-validator';


export const productValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),

  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number')
    .notEmpty()
    .withMessage('Price is required'),

  body('discountPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount Price must be a non-negative number'),

  body('description')
    .isString()
    .withMessage('Description must be a string')
    .notEmpty()
    .withMessage('Description is required'),

  body('productTypeID')
    .isInt({ min: 1 })
    .withMessage('ProductTypeID must be a positive integer')
    .notEmpty()
    .withMessage('ProductTypeID is required'),

  body('brandID')
    .isInt({ min: 1 })
    .withMessage('BrandID must be a positive integer')
    .notEmpty()
    .withMessage('BrandID is required'),

  body('categoryID')
    .isInt({ min: 1 })
    .withMessage('CategoryID must be a positive integer')
    .notEmpty()
    .withMessage('CategoryID is required'),

  body('subcategoryID')
    .isInt({ min: 1 })
    .withMessage('SubcategoryID must be a positive integer')
    .notEmpty()
    .withMessage('SubcategoryID is required'),

  body('locality')
    .isString()
    .withMessage('Locality must be a string')
    .notEmpty()
    .withMessage('Locality is required'),

  body('weightage')
    .isFloat({ min: 0 })
    .withMessage('Weightage must be a non-negative number')
    .notEmpty()
    .withMessage('Weightage is required'),

  body('image')
    .isString()
    .withMessage('Image must be a string')
    .notEmpty()
    .withMessage('Image is required'),

  body('unitSize')
    .isString()
    .withMessage('UnitSize must be a string')
    .notEmpty()
    .withMessage('UnitSize is required'),

  body('skuCode')
    .isString()
    .withMessage('SKUCode must be a string')
    .notEmpty()
    .withMessage('SKUCode is required'),

  body('barcode')
    .isString()
    .withMessage('Barcode must be a string')
    .notEmpty()
    .withMessage('Barcode is required'),

  body('cgst')
    .isFloat({ min: 0 })
    .withMessage('CGST must be a non-negative number')
    .notEmpty()
    .withMessage('CGST is required'),

  body('sgst')
    .isFloat({ min: 0 })
    .withMessage('SGST must be a non-negative number')
    .notEmpty()
    .withMessage('SGST is required'),

  body('featured')
    .isBoolean()
    .withMessage('Featured must be a boolean')
    .notEmpty()
    .withMessage('Featured is required'),

  body('subscription')
    .isBoolean()
    .withMessage('Subscription must be a boolean')
    .notEmpty()
    .withMessage('Subscription is required'),

  body('trackInventory')
    .isBoolean()
    .withMessage('TrackInventory must be a boolean')
    .notEmpty()
    .withMessage('TrackInventory is required'),
];


export const productIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ProductID must be a positive integer'),
];


export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
