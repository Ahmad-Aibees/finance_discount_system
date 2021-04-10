/**
 *
 * @param id
 * @param mobile
 * @param date
 * @returns {Readonly<{date: *, mobile: *, id: *}>}
 */
function populateCustomer({id, mobile, date}) {
    if (!id) throw new Error('id cannot be null');

    return Object.freeze({
        id, mobile, date
    });
}

/**
 *
 * @param customerId
 * @param db
 * @returns {Promise<Readonly<{date: *, mobile: *, id: *}>>}
 */
async function findCustomerById(customerId, db) {
    try {
        const {rows: customers} = await db.query('SELECT * FROM CUSTOMER WHERE id=$1', [customerId]);

        if (!customers.length) throwError(new Error('not_found_customer'));

        return populateCustomer(customers[0]);
    } catch (e) {
        throw e;
    }
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    findCustomerById: findCustomerById
}
