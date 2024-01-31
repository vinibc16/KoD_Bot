import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import path from "path";
import * as fs from 'fs';
import { groups } from '../config.json';
import BigNumber from 'bignumber.js';
import { keccak_256 } from '@noble/hashes/sha3';
import { MerkleTree } from 'merkletreejs';

const deploy = async() => {
    let codeId = null
    const mnemonic = "south clip siege dose disease fade manage gentle fluid wire soccer chunk"

    const wallet : any = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "sei" })

    const [firstAccount] = await wallet.getAccounts()
    var client = await SigningCosmWasmClient.connectWithSigner('https://sei-testnet-rpc.polkachu.com', wallet)
    if (codeId === null) {
        const contractPath = path.join(__dirname, "./cw2981_lighthouse_edition.wasm")
        const wasm = fs.readFileSync(contractPath)
        const uploadReceipt = await client.upload(firstAccount.address, wasm, "auto")
        codeId = uploadReceipt.codeId
    } else {
        codeId = parseInt(codeId)
        console.log("Using existing CW721 contract with code ID: " + codeId.toString())
    }

    let wallets = JSON.parse(fs.readFileSync('./whiteList.json', "utf-8"))

    // Hash wallet addresses
    let hashedWallets = wallets.map(keccak_256)

    // Generate Merkle tree
    const tree = new MerkleTree(hashedWallets, keccak_256, { sortPairs: true })
    const merkleRoot = tree.getRoot().toString('hex')
    console.log("START")
    console.log(merkleRoot)
    console.log("FINISH")

    let token_uri = "https://arweave.net/t1S4RJWPM9MMcSydkL1FdeUns0ldqZAKfsmEYwrzE-E"
    if (token_uri[token_uri.length - 1] === "/")
        token_uri = token_uri.slice(0, -1)
    const registerMsg = {
        register_collection: {
            cw721_code: codeId,
            name: "KoD 1",
            symbol: "KOD",
            supply: 10000,
            token_uri,
            royalty_percent: 1,
            royalty_wallet: "sei1k0m58a6p2p3u85r98lpyz5uvt070wcgax6027d",
            iterated_uri: false,
            start_order: null,
            frozen: false,
            hidden_metadata: false,
            placeholder_token_uri: null,
            mint_groups: groups.map((group: any) => {
                return {
                    name: group.name,
                    merkle_root: merkleRoot ? Array.from(Buffer.from(merkleRoot, 'hex')) : null,
                    max_tokens: group.max_tokens ? group.max_tokens : 0,
                    unit_price: (new BigNumber(group.unit_price.toString()).times(new BigNumber(1e6))).toString(),
                    creators: group.creators ? group.creators : [],
                    start_time: group.start_time ? new Date(group.start_time).getTime() / 1000 : 0,
                    end_time: group.end_time ? new Date(group.end_time).getTime() / 1000 : 0
                }
            })
        }
    }
    const registerReceipt = await client.execute(firstAccount.address, 'sei12gjnfdh2kz06qg6e4y997jfgpat6xpv9dw58gtzn6g75ysy8yt5snzf4ac', registerMsg, "auto")
    const events = registerReceipt.logs[0].events
    let collectionAddress;

    // Find the event with the type 'wasm'
    for (const event of events) {
        if (event.type === 'wasm') {
            // Find the attribute with the key 'collection'
            for (const attribute of event.attributes) {
                if (attribute.key === 'collection') {
                    collectionAddress = attribute.value;
                }
            }
        }
    }

    console.log("Transaction hash: " + registerReceipt.transactionHash)
    console.log("Collection address: " + collectionAddress)
}

deploy();