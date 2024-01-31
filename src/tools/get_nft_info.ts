import { CosmWasmClient } from "cosmwasm";
import axios from 'axios';

// REQUIRES
const moduleNetwork = require('../network/network');

class Nft {
    id : string
    tokenUri : string
    traits : Trait[]
    rarity : number

    constructor(p_id : string, p_tokenUri : string) {
        this.id = p_id
        this.tokenUri = p_tokenUri
        this.rarity = 0
    }
}

class Trait {
    traitName : string
    traitvalue : string

    constructor(p_name : string, p_value : string) {
        this.traitName = p_name
        this.traitvalue = p_value
    }
}

async function getRarity(collection : string, token_id? : string) {
    const nfts : Nft[] = await calcRarity(collection,token_id);
    const sortedNfts : Nft[] = nfts.sort((n1,n2) => {
        if (n1.rarity > n2.rarity) {
            return -1;
        }
    
        if (n1.rarity < n2.rarity) {
            return 1;
        }
    
        return 0;
    });
    console.log("Ordernado: "+sortedNfts.length)
    for(let i=0; i<sortedNfts.length; i++) {
        console.log(" Raridade: "+sortedNfts[i].rarity+" - NFT: "+sortedNfts[i].id)
    }
}

async function calcRarity(collection : string, token_id? : string) : Promise<Nft[]> {
    try {
        console.log("Inicando recuperação da coleção")
        let seiNfts : any[] = await queryCollection(collection);
        console.log("Fim recuperação da coleção")
        console.log("Inicando recuperação dos Atributos")
        let nfts : Nft[] = await getAttributes(seiNfts);
        console.log("Fim recuperação dos Atributos")
        let traitRatiry : number = 0;
        const totalNfts = nfts.length - 1
        console.log("Inicio do calculo da raridade")
        // LOOP DE TODOS OS NFTS
        if(!token_id) {
            for (let i=1; i<nfts.length; i++) {
                console.log("NFT: "+nfts[i].id);
                // LOOP DE TODOS OS TRAITS DOS NFTS
                for(let j=0; j<nfts[i].traits.length; j++) {
                    traitRatiry = 0;
                    //console.log("Trait Name: "+nfts[i].traits[j].traitName+" === Trait Value: "+nfts[i].traits[j].traitvalue)    
                    // LOOP DE TODOS OS NFTS PARA COMPRAR COM O ANTERIOR         
                    for(let k=1; k<nfts.length; k++) {
                        //LOOP DE TODOS OS TRARIS DOS NFTS COMPARAVEIS
                        for(let l=0; l<nfts[k].traits.length; l++) {
                            if (nfts[i].traits[j].traitName === nfts[k].traits[l].traitName &&
                                nfts[i].traits[j].traitvalue === nfts[k].traits[l].traitvalue) {
                                traitRatiry++;
                            }
                        }
                    }
                    nfts[i].rarity = nfts[i].rarity + (1 / (traitRatiry / totalNfts))
                }
                nfts[i].rarity = nfts[i].rarity / nfts[i].traits.length
            }
        } else {
            console.log("NFT: "+nfts[token_id].id);
            // LOOP DE TODOS OS TRAITS DOS NFTS
            for(let j=0; j<nfts[token_id].traits.length; j++) {
                traitRatiry = 0;
                //console.log("Trait Name: "+nfts[i].traits[j].traitName+" === Trait Value: "+nfts[i].traits[j].traitvalue)    
                // LOOP DE TODOS OS NFTS PARA COMPRAR COM O ANTERIOR         
                for(let k=1; k<nfts.length; k++) {
                    //LOOP DE TODOS OS TRARIS DOS NFTS COMPARAVEIS
                    for(let l=0; l<nfts[k].traits.length; l++) {
                        if (nfts[token_id].traits[j].traitName === nfts[k].traits[l].traitName &&
                            nfts[token_id].traits[j].traitvalue === nfts[k].traits[l].traitvalue) {
                            traitRatiry++;
                        }
                    }
                }
                nfts[token_id].rarity = nfts[token_id].rarity + (1 / (traitRatiry / totalNfts))
            }
            nfts[token_id].rarity = nfts[token_id].rarity / nfts[token_id].traits.length;
        }
        return nfts;       
    } catch(e){
        console.log(e);
    }    
}

async function queryCollection (collection: string) : Promise<Nft[]> {    
    try {
        let nfts : Nft[] = []
        const signingClient = await CosmWasmClient.connect(moduleNetwork.getRpcs()[0]);
        const supply = await signingClient.queryContractSmart(collection, {
            num_tokens: { }
        });
        console.log("Supply: "+supply.count)
        let nft
        for(let i=1; i<=supply.count; i++) { // MUDAR O SUPPLY
            try {
                nft = await signingClient.queryContractSmart(collection, {
                    nft_info: {
                        token_id: i.toString()
                    }
                });
            } catch(e) {
                null;
            }
            console.log("NFT: "+i.toString())
            nfts[i] = new Nft(i.toString(),nft.token_uri);
        } 
        return nfts
    } catch(e){
        throw e;
    }
}

async function getAttributes(nfts : Nft[]) : Promise<Nft[]> {
    try {
        let attributes : Trait[] = []
        
        for(let i=1; i<nfts.length; i++) {            
            // Fazendo a requisição HTTP para a URL fornecida
            const response = await axios.get(nfts[i].tokenUri);
            // Verificando se a resposta foi bem sucedida
            if (response.status === 200) {
                // Obtendo o objeto JSON da resposta
                const data = response.data;

                // Verificando se o objeto tem a chave 'attributes' e se é um array
                if (data && Array.isArray(data.attributes)) {
                    // Retornando o array de attributes
                    attributes = []
                    for(let j=0; j<data.attributes.length; j++) {
                        attributes[j] = new Trait(data.attributes[j].trait_type,data.attributes[j].value)
                    }
                    nfts[i.toString()].traits = attributes
                } else {
                    console.error('A resposta não contém o array de attributes');
                    throw new Error('A resposta não contém o array de attributes');
                }
            } else {
                console.error('Erro ao fazer a requisição:', response.statusText);
                throw new Error(`Erro ao fazer a requisição: ${response.statusText}`);
            }
        }        
        return nfts
    } catch (error) {
        console.error('Ocorreu um erro ao recuperar os attributes:', error);
        throw error; // Propagando o erro para o chamador da função
    }    
}

getRarity("sei1szeectun8vjjn6s054srn9dewh0qw6ys9vsl9wnem7edzuv2ympsemgyyf");

module.exports = { getRarity };
