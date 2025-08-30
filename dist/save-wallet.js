"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertData = insertData;
exports.fetchWalletKey = fetchWalletKey;
exports.getMySQLDateNow = getMySQLDateNow;
exports.insertTranData = insertTranData;
const db_1 = require("./db");
// Async function to insert data
function insertData(code, name, chain, publicAddr, privateKey, phrase, username, entityCode) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('token: ' + name);
        let conn;
        try {
            conn = yield db_1.pool.getConnection();
            const insertQuery = `
    INSERT INTO mmc_coin_wallet (symbol,entity_code,chain,username,
      public_address,private_key,name,status,phrase)
      VALUES (?, ?, ?, ?, ?,
         ?, ?,?,? )
    `;
            //const id = symbol + close_date;
            const values = [code, entityCode, chain, username,
                publicAddr, privateKey, name, 'Active', phrase]; // Replace with your actual data
            //const [resultx] = await pool.execute(insertQuery, values);
            const [resultx] = yield conn.execute(insertQuery, values);
            console.log('coin inserted:', resultx);
        }
        catch (err) {
            console.error('Error inserting data:', err);
        }
        finally {
            if (conn)
                conn.release();
        }
    });
}
function fetchWalletKey(code, chain, publicAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('token: ' + publicAddr + ' ' + code + " " + chain);
        let conn;
        let privatekey;
        try {
            conn = yield db_1.pool.getConnection();
            const selectQuery = "select private_key from mmc_coin_wallet WHERE symbol = ? AND chain = ? and public_address = ? ";
            //const id = symbol + close_date;
            const values = [code, chain, publicAddr]; // Replace with your actual data
            const [rows] = yield conn.execute(selectQuery, values);
            console.log('rows ' + rows.length);
            if (rows.length > 0) {
                privatekey = rows[0].private_key;
            }
        }
        catch (err) {
            console.error('Error fetching data:', err);
        }
        finally {
            if (conn)
                conn.release();
        }
        return privatekey;
    });
}
function getMySQLDateNow() {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    const hours = `${now.getHours()}`.padStart(2, '0');
    const minutes = `${now.getMinutes()}`.padStart(2, '0');
    const seconds = `${now.getSeconds()}`.padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function insertTranData(externalRef, txId, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        //console.log('token: ' + name);
        let conn;
        try {
            conn = yield db_1.pool.getConnection();
            const insertQuery = `
      INSERT INTO mmc_chain_tx (external_ref,tx_id,chain)
        VALUES (?, ?, ?)
      `;
            //const id = symbol + close_date;
            const values = [externalRef, txId, chain]; // Replace with your actual data
            //const [resultx] = await pool.execute(insertQuery, values);
            const [resultx] = yield conn.execute(insertQuery, values);
            console.log('tx inserted:', resultx);
        }
        catch (err) {
            console.error('Error inserting data:', err);
        }
        finally {
            if (conn)
                conn.release();
        }
    });
}
//insertData();
//# sourceMappingURL=save-wallet.js.map