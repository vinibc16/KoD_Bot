import * as fs from 'fs';
import { network } from './config.json'

function getRpcs () {
    let rpcList
    if (network == 'pacific-1') { 
        rpcList = fs.readFileSync('../network/rpcs_mainnet.txt', 'utf-8');
    } else {
        rpcList = fs.readFileSync('../network/rpcs_testnet.txt', 'utf-8');
    }
    
    const rpcs = rpcList.split(/\r?\n/);
    let rpc: string[] = [];
    let count = 0;
    rpcs.forEach(async (line) => {
        rpc[count] = line;
        count++;
    });
    return rpc;
}

function getMainRpc() {
    let rpcList
    if (network == 'pacific-1') { 
        rpcList = fs.readFileSync('../network/rpcs_mainnet.txt', 'utf-8');
    } else {
        rpcList = fs.readFileSync('../network/rpcs_testnet.txt', 'utf-8');
    }
    
    const rpcs = rpcList.split(/\r?\n/);
    let rpc: string[] = [];
    rpcs.forEach(async (line) => {
        return line;
    });
    return rpc;
}

function getLighthouseContract(p_network: string) {
    if (p_network === "pacific-1") {
        return "sei1hjsqrfdg2hvwl3gacg4fkznurf36usrv7rkzkyh29wz3guuzeh0snslz7d";
    } else {
        return "sei12gjnfdh2kz06qg6e4y997jfgpat6xpv9dw58gtzn6g75ysy8yt5snzf4ac";
    }
}

export { network, getRpcs, getLighthouseContract, getMainRpc }