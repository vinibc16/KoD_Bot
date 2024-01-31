import * as fs from 'fs';
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { HexString } from "aptos";

async function getAccs() {
    const pks = fs.readFileSync('../wallet/private_keys.txt', 'utf-8');
    const pk = pks.split('\r\n');
    let wallets = [];
    let count = 0;
    for(let i=0; i<pk.length; i++) {
        const privateKeyBytes = HexString.ensure(pk[i]).toUint8Array();
        const wallet = await DirectSecp256k1Wallet.fromKey(privateKeyBytes, "sei");        
        wallets[count] = wallet;
        count++;
    }
    console.log("Wallets carregadas!");
    return wallets;   
}

async function getSignerFromPrivateKey(privateKey: string, prefix: string) {
    return await DirectSecp256k1Wallet.fromKey(
      Buffer.from(privateKey, "hex"),
      prefix
    );
}

export { getAccs, getSignerFromPrivateKey }