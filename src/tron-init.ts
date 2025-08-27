import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';

dotenv.config();

export function initWeb() {

    const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE_URL,
        privateKey: process.env.PRIVATE_KEY_NILE,
      });

      return tronWeb;

}


