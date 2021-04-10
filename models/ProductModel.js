/**
 *
 * @param id
 * @param name
 * @param category_id
 * @param discount_id
 * @returns {Readonly<{name: *, id: *, discountID: *, categoryID: *}>}
 */
function populateProduct({id, name, category_id, discount_id}) {
    if (!id) throw new Error('id cannot be null');
    if (!name) throw new Error('name cannot be null');

    return Object.freeze({id, name, categoryID: category_id, discountID: discount_id})
}

/**
 *
 * @param productID
 * @param populateDiscount
 * @param db
 * @returns {Promise<Readonly<{product: Readonly<{name: *, id: *, discountID: *, categoryID: *}>, discount: null}>>}
 */
async function findProductById(productID, populateDiscount, db) {
    try {
        const {rows: products} = await db.query('SELECT p.*, d.discount_percent, d.due_date FROM PRODUCT p LEFT JOIN DISCOUNT d ON d.id=p.discount_id AND d.due_date > date_part(\'epoch\', CURRENT_TIMESTAMP)::int WHERE p.id = $1;', [productID]);

        if (!products.length) throwError(new Error('not_found_product'));
        const product = populateProduct(products[0]);

        let discount = null;

        if (products[0]['discount_percent']) discount = populateDiscount(products[0]);

        return Object.freeze({
            product,
            discount
        });
    } catch (e) {
        throw e;
    }
}

/**
 *
 * @param productName
 * @param populateDiscount
 * @param db
 * @returns {Promise<Readonly<{product: Readonly<{name: *, id: *, discountID: *, categoryID: *}>, discount: null}>>}
 */
async function findProductByName(productName, populateDiscount, db) {
    try {
        const {rows: products} = await db.query('SELECT p.*, d.discount_percent, d.due_date FROM PRODUCT p LEFT JOIN DISCOUNT d ON d.id=p.discount_id AND d.due_date > date_part(\'epoch\', CURRENT_TIMESTAMP)::int WHERE p.name = $1;', [productName]);

        if (!products.length) throwError(new Error('not_found_product'));
        const product = populateProduct(products[0]);

        let discount = null;

        if (products[0]['discount_percent']) discount = populateDiscount(products[0]);

        return Object.freeze({
            product,
            discount
        });
    } catch (e) {
        throw e;
    }
}

/**
 * retrieves all products from database
 * @param populateDiscount
 * @param db
 * @returns {Promise<Uint8Array|BigInt64Array|*[]|Float64Array|Int8Array|Float32Array|Int32Array|Uint32Array|Uint8ClampedArray|BigUint64Array|Int16Array|Uint16Array>}
 */
async function getAllProducts(populateDiscount, db) {
    try {
        let {rows: products} = await db.query('SELECT p.*, d.discount_percent, d.due_date FROM PRODUCT p LEFT JOIN DISCOUNT d ON d.id=p.discount_id AND d.due_date > date_part(\'epoch\', CURRENT_TIMESTAMP)::int;');

        return products.map(item => {
            let product = populateProduct(item), discount = null;
            if (item['discount_percent']) discount = populateDiscount(item);
            return Object.freeze({
                product,
                discount
            });
        });
    } catch (e) {
        throw e;
    }
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    findProductByName: findProductByName,
    getAllProducts: getAllProducts
};
