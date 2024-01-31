import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";

// REQUIRES
const moduleNetwork = require('../network/network');
const moduleWallets = require('../wallet/wallets');

const queryCollection = async (collection: string) => {    
    try {
        const gasPrice = GasPrice.fromString("0.1usei");
        const client = await SigningCosmWasmClient.connectWithSigner(moduleNetwork.getRpcs()[0], moduleWallets[0]);
        let codes : any
        let coll : any 
                
        try {
            coll = await client.queryContractSmart(moduleNetwork.getLighthouseContract(moduleNetwork.network), { get_collection: { collection: collection }});
        } catch(e){
            return "Coleção não existe";
        }
        if (coll) {         
            return coll         
        }      
    } catch(e) {
        console.log(e);
    }
}

queryCollection("sei1gn3lg0wfaxvwg2tmktkurs2h2uw6f5z06spwtdeg0eh0qde5uksslhfgcp")

export { queryCollection }
