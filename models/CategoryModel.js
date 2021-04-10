/**
 *
 * @param id
 * @param name
 * @param parent_category_id
 * @param date
 * @returns {Readonly<{date: *, name: *, parentCategoryID: *, id: *}>}
 */
function populateCategory({id, name, parent_category_id, date}) {
    if (!id) throw new Error('id cannot be null');
    if (!name) throw new Error('name cannot be null');
    return Object.freeze({
        id, name, parentCategoryID: parent_category_id, date
    });
}

/**
 *
 * @param categoryID
 * @param populateDiscount
 * @param db
 * @returns {Promise<Readonly<{discount: Readonly<{id: *, discountPercent: *, dueDate: *}>, category: Readonly<{date: *, name: *, parentCategoryID: *, id: *}>}>>}
 */
async function findCategoryByID(categoryID, populateDiscount, db) {
    try {
        const {rows: categories} = await db.query('SELECT c.*, d.discount_percent, d.due_date FROM CATEGORY c LEFT JOIN DISCOUNT d ON d.id=c.discount_id AND d.due_date > date_part(\'epoch\', CURRENT_TIMESTAMP)::int WHERE c.id=$1;', [categoryID]);

        if (!categories.length) throwError(new Error('not_found'));
        const category = populateCategory(categories[0]);

        let discount = null;

        if (categories[0]['discount_percent']) discount = populateDiscount(categories[0]);

        return Object.freeze({
            category,
            discount
        });
    } catch (e) {
        throw e;
    }
}

/**
 *
 * @param childID
 * @param populateDiscount
 * @param db
 * @returns {Promise<Readonly<{discount: Readonly<{id: *, discountPercent: *, dueDate: *}>, category: Readonly<{date: *, name: *, parentCategoryID: *, id: *}>}>>}
 */
async function findCategoryByChildId(childID, populateDiscount, db) {
    try {
        const {rows: categories} = await db.query('SELECT parent.*, d.discount_percent, d.due_date FROM CATEGORY child INNER JOIN CATEGORY parent ON parent.id=child.parent_category_id LEFT JOIN DISCOUNT d ON d.id=parent.discount_id AND d.due_date > date_part(\'epoch\', CURRENT_TIMESTAMP)::int WHERE child.id=$1', [childID]);

        if (categories.length) throwError(new Error('not_found'));

        const category = populateCategory(categories[0]);

        let discount = null;

        if (categories[0]['discount_percent']) discount = populateDiscount(categories[0]);

        return Object.freeze({
            category,
            discount
        });
    } catch (e) {
        throw e;
    }
}

/**
 * extracted the category chain based on productID
 * detects loops in category graph
 * @param categoryID
 * @param populateDiscount
 * @param db
 * @returns {Promise<[]>}
 */
async function extractChain(categoryID, populateDiscount, db) {
    try {
        const chain = [];
        const {discount, category} = await findCategoryByID(categoryID, populateDiscount, db);

        let repeated, lastCategory = category;

        chain.push(Object({
            category, discount
        }));

        while (!repeated && lastCategory.parentCategoryID) {
            const {discount: nextDiscount, category: nextCategory} = await findCategoryByID(lastCategory.parentCategoryID, populateDiscount, db);

            repeated = chain.find(item => {
                return item.category.id === nextCategory.id
            });

            if (!repeated) {
                chain.push(Object({
                    category: nextCategory, discount: nextDiscount
                }));
                lastCategory = nextCategory;
            }
        }

        return chain;
    } catch (e) {
        throw e;
    }
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    extractChain: extractChain
}
