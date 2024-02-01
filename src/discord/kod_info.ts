import { Client, Events, GatewayIntentBits } from 'discord.js';

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

client.once(Events.ClientReady, c=> {
    console.log(`Pronto! Login realizado como ${c.user.tag}`);
})

client.on("messageCreate", async (message) => {
    //console.debug("START DEBUG")
    //console.log(message);    
    //console.debug("END DEBUG")
    if (!message.content.startsWith(prefixo) || message.author.bot || !message.guild) return

    try {
        const commandId = message.content.toLowerCase().split(" ")[0].substring(prefixo.length);
        const param1 = message.content.toLowerCase().split(" ")[1];
        const param2 = message.content.toLowerCase().split(" ")[2];

        if (commandId === "info") {
            const collInfo = await _get_collection.getMintCollection(param1);
            await message.reply("Contrato: "+collInfo)
        } else if (commandId === "rank") {
            
        } else if (commandId === "top100") {
            const nfts : Nft[] = await _get_nft_info.getRarity(param1)
            let top100 : string
            for(let i=0; i<nfts.length; i++) {
                top100 = top100 + "," + nfts[i].id
            }
        }

    } catch(e) {
        console.log(e)
    }
    
})

client.login(token)


