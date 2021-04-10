/**
 *
 * @param id
 * @param discount_id
 * @param discount_code
 * @param discount_amount
 * @param customer_id
 * @param discount_percent
 * @param minAmount
 * @param expiration_date
 * @param company_id
 * @param reference_id
 * @param reference_type
 * @param date
 * @returns {Readonly<{date: *, minAmount: *, companyID: *, discountPercent: *, discountCode: *, discountAmount: *, referenceType: *, id: *, referenceID: *, expirationDate: *}>}
 */
function populateDiscountCode({id, discount_id, discount_code, discount_amount, customer_id, discount_percent, minAmount, expiration_date, company_id, reference_id, reference_type, date}) {
    if (!id && !discount_id) throw new Error('id cannot be null');
    if (!discount_code) throw new Error('discountCode cannot be null');
    if (!minAmount && minAmount < 0) throw new Error('minAmount cannot be less than 0');
    if (!reference_id) throw new Error('referenceID cannot be null');
    if (!reference_type && reference_type !== 'PRODUCT' && reference_type !== 'CATEGORY')
        throw new Error('unacceptable referenceType ' + reference_type);
    if (discount_percent > 100) throw new Error('wrong percent');
    return Object.freeze({
        id: discount_id || id,
        discountCode: discount_code,
        discountAmount: discount_amount,
        discountPercent: discount_percent,
        expirationDate: expiration_date,
        companyID: company_id,
        referenceID: reference_id,
        customerID: customer_id,
        minAmount,
        referenceType: reference_type,
        date
    });
}

/**
 *
 * @param discountCode
 * @param amount
 * @param companyID
 * @param customerID
 * @param db
 * @returns {Promise<Uint8Array|BigInt64Array|Readonly<{date: *, minAmount: *, companyID: *, discountPercent: *, discountCode: *, discountAmount: *, referenceType: *, id: *, referenceID: *, expirationDate: *}>[]|Float64Array|Int8Array|Float32Array|Int32Array|Uint32Array|Uint8ClampedArray|BigUint64Array|Int16Array|Uint16Array>}
 */
async function findDiscountCodeByCode(discountCode, amount, companyID, customerID, db) {
    try {
        const {rows: discountCodes} = await db.query('SELECT * FROM DISCOUNT_CODE WHERE discount_code = $1 AND min_amount < $2 AND expiration_date > date_part(\'epoch\', CURRENT_TIMESTAMP)::int AND (company_id = $3 OR company_id IS NULL) AND (customer_id = $4 OR customer_id IS NULL);', [discountCode, amount, companyID, customerID]);

        return discountCodes.map(discountCode => populateDiscountCode(discountCode));
    } catch (e) {
        throw e;
    }
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    findDiscountCodeByCode: findDiscountCodeByCode
}
