import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { keccak_256 } from '@noble/hashes/sha3';
import { MerkleTree } from 'merkletreejs';
import * as fs from 'fs';
import { newMinted } from "../discord/webhook";
const moduleNetwork = require('../network/network');
const moduleWallets = require('../wallet/wallets');
const _get_whitelist = require('../tools/get_whitelist');
const _get_collection = require('../tools/get_collection');
import { GasPrice } from "@cosmjs/stargate";

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const mint = async (p_rpc : string, collection : string, site : string, groupName : string, wallet : any) => {
    let mintar : boolean = true
    const gasPrice = GasPrice.fromString("0.5usei"); //GAS
    const client = await SigningCosmWasmClient.connectWithSigner(p_rpc, wallet, { gasPrice: gasPrice });
    const collectionConfig = await client.queryContractSmart(moduleNetwork.getLighthouseContract(moduleNetwork.network), { 
        get_collection: { collection }
     });
    let group: any = null
    let mintPrice: number
    for (let g of collectionConfig.mint_groups) {
        if (g.name === groupName) {
            group = g
            mintPrice = g.unit_price
            break;
        }
    }

    if (group === null) {
        console.log("Group not found")
        mintar = false;
        return
    }

    const useiBalance = await client.getBalance(wallet.address,'usei');
    let mintCost : number
    if ( Number(moduleNetwork.getLighthouseContract(moduleNetwork.network).fee) > 0) {
        mintCost = Number(group.unit_price) + Number(moduleNetwork.getLighthouseContract(moduleNetwork.network).fee);
    } else {
        mintCost = Number(group.unit_price);
    }
    if (mintCost > Number(useiBalance.amount)) {
        console.log("No funds for mint!")
        mintar = false;
        return
    } else {
        let merkleProof: any = null
        let hashedAddress: any = null      

        if (group.merkle_root !== "" && group.merkle_root !== null) {
            //_get_whitelist.retrieveAndFilterData(site,groupName);
            let whitelist = JSON.parse(fs.readFileSync('./whiteList.json', "utf-8"))
            let hashedWallets = whitelist.map(keccak_256)
            const tree = new MerkleTree(hashedWallets, keccak_256, { sortPairs: true })  
            merkleProof = tree.getProof(Buffer.from(keccak_256(wallet.address))).map(element => Array.from(element.data))
            hashedAddress = Array.from(Buffer.from(keccak_256(wallet.address)))
        }
        
        const mintMsg = {
            mint_native: {
                collection,
                group: groupName,
                recipient: wallet.address,
                merkle_proof: merkleProof,
                hashed_address: hashedAddress
            }
        }
        let mintReceipt : any
        while(mintar) {
            try {
                mintReceipt = await client.execute(wallet.address, moduleNetwork.getLighthouseContract(moduleNetwork.network), mintMsg, "auto", "")
                console.log("NFT Minted Rpc:"+p_rpc);
                console.log("Transaction hash: " + mintReceipt.transactionHash);
                newMinted(collectionConfig.name,mintReceipt.transactionHash,wallet.address,moduleNetwork.network);

            } catch(e) {
                if (e instanceof Error) {
                    if (e.message.indexOf("Max Tokens Minted") != -1) {
                        console.log("Max Tokens Minted!")
                        mintar = false;
                    } else if (e.message.indexOf("Sold out") != -1) {
                        console.log("Sold out! Wallet: "+wallet.address)
                        mintar = false;
                    } else if (e.message.indexOf("Group Not Open to Mint") != -1) {
                        console.log("Group Not Open to Mint!")
                        delay(2000);
                    } else {
                        // DESCOMENTAR PARA DEBUG
                        console.log("Network: "+p_rpc+" - Não mintou "+e)
                    }
                } 
            }
        }
    }
}

const main = async (site : string, groupName : string) => {
    if (!groupName) {
        console.log("You must specify a group to mint from")
    }
    if (!site) {
        console.log("You must specify the site")
    }
    const collection = await _get_collection.getMintCollection(site)
    const rpcs = moduleNetwork.getRpcs();
    const wallets = await moduleWallets.getAccs()
    for(let i = 0; i<rpcs.length; i++) {
        console.log("Loaded RPC -> "+rpcs[i]);
        for(let j=0; j<wallets.length; j++) {
            try {
                Promise.all([mint(rpcs[i],collection,site,groupName,wallets[j])]);
                await delay(500);
            } catch(e) {
                console.log("RPC Error!")
            }
        }        
    }
}

// Testnet
//main("sei1jwcq78j2d2qg2nm0ac8zwhw0yz2t2h03fzh86jlmxwz6y55wsreqw59lh7","Whitelist");
// Mainnet
//main("sei1l3nkhmqn9wc4lz2t54pej5q0e45m8gaw6gqwd25kfcqpe0tdwk6s7xpw8q","public");


// Shipmunk
main("https://mint.unfrgtn.space","Public");
