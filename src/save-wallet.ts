
import { pool } from './db';

// Async function to insert data
export async function insertData(code: string ,name: string, chain: string, 
  publicAddr: string, privateKey: string, phrase: string,username: string,entityCode: string) {

  console.log('token: ' + name);
  
  let conn;
  try {

    conn = await pool.getConnection();
    const insertQuery = `
    INSERT INTO mmc_coin_wallet (symbol,entity_code,chain,username,
      public_address,private_key,name,status,phrase)
      VALUES (?, ?, ?, ?, ?,
         ?, ?,?,? )
    `;

    //const id = symbol + close_date;
    const values = [code,entityCode,chain,username,
    publicAddr,privateKey,name,'Active',phrase] // Replace with your actual data

    //const [resultx] = await pool.execute(insertQuery, values);
    const [resultx] = await conn.execute(insertQuery, values);
  console.log('coin inserted:', resultx);

  } catch (err) {
    console.error('Error inserting data:', err);
  } finally {
    if (conn) conn.release();
    
  }
}


export async function fetchWalletKey(code: string , chain: string, 
  publicAddr: string) {

  console.log('token: ' + publicAddr + ' ' + code + " " + chain);
  
  let conn;
  let privatekey
  try {

    conn = await pool.getConnection();
    const selectQuery = "select private_key from mmc_coin_wallet WHERE symbol = ? AND chain = ? and public_address = ? ";


    //const id = symbol + close_date;
    const values = [code,chain,publicAddr] // Replace with your actual data

    const [rows] = await conn.execute(selectQuery, values);

    console.log('rows ' + rows.length)

    if (rows.length > 0) {
      privatekey = rows[0].private_key;
    }
  


  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    if (conn) conn.release();
    
  }

  return privatekey;
}



export function getMySQLDateNow(): string {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
  
    const hours = `${now.getHours()}`.padStart(2, '0');
    const minutes = `${now.getMinutes()}`.padStart(2, '0');
    const seconds = `${now.getSeconds()}`.padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

//insertData();