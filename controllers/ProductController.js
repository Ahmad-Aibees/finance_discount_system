const productModel = require('../models/ProductModel');
const categoryModel = require('../models/CategoryModel');
const discountModel = require('../models/DiscountModel');
const connect = require('../config/db');
const {handleError, throwError, callbackResponse} = require('../methods/RequestMethods');

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getProductTree(req, res) {
    let db;
    try {
        db = connect.getPool();

        const products = await productModel.getAllProducts(discountModel.populateDiscount, db);

        const results = await Promise.all(products.map(async (item) => {
            let chain, result = [Object({productName: item.product.name, discountPercent: item.discount ? item.discount.discountPercent : -1})];
            if (item.product.categoryID) {
                chain = await categoryModel.extractChain(item.product.categoryID, discountModel.populateDiscount, db);
                result = result.concat(chain.map(item => Object({categoryName: item.category.name, discountPercent: item.discount ? item.discount.discountPercent : -1})))
            }
            return result;
        }));

        callbackResponse(200, res, null, results);
    } catch (e) {
        handleError(res, e);
    } finally {
        if (db) db.end();
    }
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    getProductTree: getProductTree
}
