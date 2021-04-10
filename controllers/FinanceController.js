const connect = require('../config/db');
const {callbackResponse, handleError, validateInput} = require('../methods/RequestMethods');
const {Condition} = require('../classes/InputConditions');
const productModel = require('../models/ProductModel');
const categoryModel = require('../models/CategoryModel');
const discountModel = require('../models/DiscountModel');
const discountCodeModel = require('../models/DiscountCodeModel');
const customerModel = require('../models/CustomerModel');

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function checkDiscountCode(req, res) {
    let db;
    try {
        let inputError = validateInput(req.body, [
            new Condition({
                label: 'userID', required: true, type: 'number'
            }),
            new Condition({
                label: 'productName', type: 'number', required: true
            }),
            new Condition({
                label: 'cost', type: 'number', required: true
            })
        ]);

        if (inputError) throwError(inputError);

        const {productName, userID, cost, discountCode} = req.body;
        const {company} = req;
        let discount, chain = [], firstCategoryWithDiscount;

        db = connect.getPool();

        await customerModel.findCustomerById(userID, db);

        const discountCodes = await discountCodeModel.findDiscountCodeByCode(discountCode, cost, company.id, userID, db);

        // get tree array
        let {product, discount: productDiscount} = await productModel.findProductByName(productName, discountModel.populateDiscount, db);

        let enabledProductDiscountCode = discountCodes.find(codeObject => {
            return codeObject.referenceType === 'PRODUCT' && codeObject.referenceID === product.id;
        });

        if ((discountCode && !enabledProductDiscountCode) || product.categoryID) {
            chain = await categoryModel.extractChain(product.categoryID, discountModel.populateDiscount, db) || [];
            firstCategoryWithDiscount = chain.find(item => { return !(!item.discount); });
            for (let i = 0; i <= chain.length && !enabledProductDiscountCode; i++) {
                enabledProductDiscountCode = discountCodes
                    .find(codeObject => {
                        return codeObject.referenceType === 'CATEGORY' && codeObject.referenceID === chain[i].category.id;
                    });
            }
        }

        discount = productDiscount ? productDiscount : firstCategoryWithDiscount ? firstCategoryWithDiscount.discount: null;

        let appliedPercent = ((discount ? discount.discountPercent : 0) + (enabledProductDiscountCode ? enabledProductDiscountCode.discountPercent : 0)) || -1;

        callbackResponse(200, res, null, {
            percent: appliedPercent > 100 ? 100 : appliedPercent
        });
    } catch (e) {
        handleError(res, e);
    } finally {
        if (db) db.end();
    }
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    checkDiscountCode: checkDiscountCode
}
