import { Client, Events, GatewayIntentBits } from 'discord.js';

const token = "MTIwMDg5MDg5MDA4OTE0ODU1Nw.GX-G9p.GGlvR7-ZUbbkpidaF90uZsG7VNpaSkshnRasQE"

const client = new Client({ intents: [
                                    GatewayIntentBits.Guilds,
                                    GatewayIntentBits.GuildMessages,
                                    GatewayIntentBits.MessageContent
                                    ] 
                        });

const prefixo = "!";
const moduleColl = require('../tools/collection_info')
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

        if (commandId === "info") {
            const collInfo = await _get_collection.getMintCollection(param1);
            console.log("Contrato: "+collInfo);
            await message.reply("Contrato: "+collInfo)
        } else if (commandId === "rank") {
            const nft = await moduleColl.queryContractSmart(param1, {
                owner_of: {
                    token_id: 253
                }
            });
            console.log("DEBUG 1")
            console.log(nft)
        }
    } catch(e) {
        console.log(e)
    }
    
})

client.login(token)


