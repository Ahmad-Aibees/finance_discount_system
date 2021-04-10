/**
 *
 * @param id
 * @param discountID
 * @param date
 * @returns {Readonly<{date: *, discountPercent: *, dueDate: *, referenceType: *, id: *, discountID: *, referenceID: *}>}
 */
function populateDiscount({id, discount_id, discount_percent, company_id, due_date, date}) {
    if (!id && !discount_id) throw new Error('id cannot be null');
    if (!discount_percent || discount_percent < 0) throw new Error('discountPercent cannot be null or less than 0');
    return Object.freeze({
        id, discountID: discount_id, discountPercent: discount_percent, companyID: company_id, dueDate: due_date, date
    });
}

async function findDiscountById(id, companyID, db) {
    try {
        const {rows: discounts} = await db.query('SELECT * FROM DISCOUNT WHERE id = $1 AND (company_id IS NULL OR company_id = $2)', [id, companyID]);

        if (!discounts.length) throwError(new Error('not found discount'));

        return populateDiscount(discounts[0]);
    } catch (e) {
        throw e;
    }
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    populateDiscount: populateDiscount
}
