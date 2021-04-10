function populateCompany({id, username, password, date}) {
    if (!id) throw new Error('id cannot be null');
    if (!username) throw new Error('username cannot be null');

    return Object.freeze({id, username, password, date});
}

/**
 *
 * @param username
 * @param db
 * @returns {Promise<Readonly<{date: *, password: *, id: *, username: *}>>}
 */
async function findCompanyByUserName(username, db) {
    try {
        const {rows: companies} = await db.query('SELECT * FROM COMPANY WHERE username = $1', [username]);

        if (!companies.length) throwError(new Error('not_found'));

        return populateCompany(companies[0]);
    } catch (e) {
        throw e;
    }
}

/**
 *
 * @param companyID
 * @param db
 * @returns {Promise<Readonly<{date: *, password: *, id: *, username: *}>>}
 */
async function findCompanyByUserID(companyID, db) {
    try {
        const {rows: companies} = await db.query('SELECT * FROM COMPANY WHERE id = $1', [companyID]);

        if (!companies.length) throwError(new Error('not_found'));

        return populateCompany(companies[0]);
    } catch (e) {
        throw e;
    }
}

/**
 *
 * @param companyID
 * @param password
 * @param db
 * @returns {Promise<void>}
 */
async function setPassword(companyID, password, db) {
    try {
        const results = await db.query('UPDATE COMPANY SET password=$1 WHERE id=$2', [password, companyID]);

        if (!results.rowCount) throwError(new Error('not_updated'));
    } catch (e) {
        throw e;
    }
}

// noinspection JSUndefinedPropertyAssignment
module.exports = {
    findCompanyByUserName: findCompanyByUserName,
    setPassword: setPassword
}
