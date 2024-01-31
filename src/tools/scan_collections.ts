import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import fs from "fs";
import { GasPrice } from "@cosmjs/stargate";

// REQUIRES
const moduleWebhook = require('../discord/webhook');
const moduleNetwork = require('../network/network');
const moduleWallets = require('../wallet/wallets');

export class Groups{
    grpName: string;
    price: number;
    limitPerWallet: number;
    startDate: number;

    constructor(grpName: string, price: number, limitPerWallet: number, startDate: number){
		this.grpName = grpName;
		this.price = price;
		this.limitPerWallet = limitPerWallet;
        this.startDate = startDate;
	}
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const scan_collections = async () => {    
    const config = JSON.parse(fs.readFileSync("../config.json", "utf-8"));

    while(true) {
        try {
            const gasPrice = GasPrice.fromString("0.1usei");
            const client = await SigningCosmWasmClient.connectWithSigner(moduleNetwork.getRpcs()[0], moduleWallets[0]);
            const contract = await client.getContracts(config.codeId);
            let codes : any
            try {
                codes = await client.getCodeDetails(config.codeId)
            } catch(e) {
                null;
            }
            if (codes) {
                let coll : any
                try {
                    coll = await client.queryContractSmart(moduleNetwork.getLighthouseContract(moduleNetwork.network), { get_collection: { collection: contract[(contract.length-1)] }});
                } catch(e){
                    null;
                }
                if (coll) {            
                    const restantes = parseInt(coll.supply) - parseInt(coll.next_token_id);
                    let grps: Groups[] = [];
                    console.log("Coleção: "+coll.name)
                    if (restantes > 0 ) {
                        for(let j=0; j<coll.mint_groups.length; j++) {
                            grps[j] = new Groups(coll.mint_groups[j].name,
                                                coll.mint_groups[j].unit_price / 1000000,
                                                coll.mint_groups[j].max_tokens,
                                                coll.mint_groups[j].start_time);
                            moduleWebhook.newCollection(coll.name,
                                                        parseInt(coll.supply),
                                                        grps,
                                                        coll.cw721_address);                                            
                        }
                    }         
                }      
                config.codeId++;
                fs.writeFileSync("../config.json", JSON.stringify(config, null, 4));          
            }
            await delay(60000);            
        } catch(e) {
            console.log(e);
        }
    }
}

scan_collections();
