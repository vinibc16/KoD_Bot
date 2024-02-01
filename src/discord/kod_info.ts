import { Client, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js';
import { Embed } from '@vermaysha/discord-webhook'

const token = "MTIwMDg5MDg5MDA4OTE0ODU1Nw.GX-G9p.GGlvR7-ZUbbkpidaF90uZsG7VNpaSkshnRasQE"

class Nft {
    id : string
    traits : Trait[]
    rarity : number
    rank : number

    constructor(p_id : string, p_traits : Trait[]) {
        this.id = p_id
        this.rarity = 0
        this.traits = p_traits
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

const client = new Client({ intents: [
                                    GatewayIntentBits.Guilds,
                                    GatewayIntentBits.GuildMessages,
                                    GatewayIntentBits.MessageContent
                                    ] 
                        });

const prefixo = "!";
const _get_nft_info = require('../tools/get_nft_info')
const _get_collection = require('../tools/get_collection')
const _collection_info = require('../tools/collection_info')

client.once(Events.ClientReady, c=> {
    console.log(`Pronto! Login realizado como ${c.user.tag}`);
})

client.on("messageCreate", async (message) => {
    //console.debug("START DEBUG")
    //console.log(message.channelId);    
    //console.debug("END DEBUG")
    if (!message.content.startsWith(prefixo) || message.author.bot || !message.guild) return
    if ( message.channelId != "1202616180461015161" && message.channelId != "1202605595761446942" ) return

    try {
        const exampleEmbed = new EmbedBuilder()
        const commandId = message.content.toLowerCase().split(" ")[0].substring(prefixo.length);
        const param1 = message.content.toLowerCase().split(" ")[1];
        const param2 = message.content.toLowerCase().split(" ")[2];

        if (commandId === "info") {
            const collInfo = await _get_collection.getMintCollection(param1);
            exampleEmbed.setTitle("Contrato: ```"+collInfo+"```")
            exampleEmbed.setColor(0x0099FF)
            const contract = await _collection_info.queryCollection(collInfo)
            for(let i=0; i<contract.mint_groups.length; i++) {
                const count = await _get_collection.getWlCount(param1,contract.mint_groups[i].name)
                console.log()
                if (contract.mint_groups[i].merkle_root && count > 0) {
                    exampleEmbed.addFields (
                        { name: contract.mint_groups[i].name, value: ""+count, inline: false }
                    )
                }
            }
            exampleEmbed.setTimestamp()
            exampleEmbed.setFooter({ text: 'Agradeço se puder contribuir com SEI: sei1w07m4nj6dxdrzt0gs3fud859fke265qq75f40g' });
            message.reply({embeds: [exampleEmbed]});            
        } else if (commandId === "rank") {
            null;
        } else if (commandId === "lendarios") {
            if(!param1) {
                await message.reply("Informe qual é a coleção. (!lendarios sei1...) ")
            } else {
                try {
                    let collInfo
                    if(param1.startsWith("sei")) {
                        collInfo = await _collection_info.queryCollection(param1)
                    } else {
                        const contract = await _get_collection.getMintCollection(param1);
                        collInfo = await _collection_info.queryCollection(contract)
                    }
                    
                    await message.reply(`Recuperando NFT's lendarios da coleção ${collInfo.name}, por favor aguarde.`)
                    const nfts : Nft[] = await _get_nft_info.getRarity(collInfo.cw721_address)
                    let lendarios : string
                    if(!nfts) {
                        await message.reply("Erro em recuperar a coelação.")
                    }
                    for(let i=0; i<nfts.length; i++) {
                        if(nfts[i].rank <100){
                            if(!lendarios) {
                                lendarios = nfts[i].id
                            } else {
                                lendarios = lendarios + " " + nfts[i].id
                            }
                            
                        } else {
                            break;
                        }                
                    }
                    await message.reply("Lista de lendários ordenada: "+lendarios)
                } catch(e) {
                    await message.reply("Erro em recuperar a coelação. Verifique se a coleção existe.")
                }                
            }            
        }

    } catch(e) {
        console.log(e)
    }
    
})

client.login(token)


