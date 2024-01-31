import { Embed, Webhook } from '@vermaysha/discord-webhook'
import { Groups } from '../tools/scan_collections';
import { minted_webhook, scan_webhook } from './config.json'

function newCollection(p_name: string, p_supply: number, p_grps: Groups[], p_collection: string) {
  try {
    const hook = new Webhook(scan_webhook); 
    let embed = new Embed();
    embed
      .setTitle('NEW SEI Collection Detected!')
      .setColor('#e86d82')
      .setAuthor({
        name: 'KoD Bot',
        icon_url:
          'https://i.ibb.co/ZLqGrFy/295570317-426126936220968-1116765690902656103-n.jpg',
        url: 'https://discord.gg/DWkv4k7D',
      })
      .setFooter({
        text: 'Enviado',
        icon_url:
          'https://i.ibb.co/ZLqGrFy/295570317-426126936220968-1116765690902656103-n.jpg',
      })
      .setTimestamp()
      .addField({
        name: 'Nome',
        value: ''+p_name,
        inline: true,
      })
      .addField({
        name: 'Supply',
        value: ''+p_supply,
        inline: true,
      })
      .addField({
        name: 'Mint Phases',
        value: '**NAME - PRICE - LIMIT_PER_WALLET - START_TIME**',
        inline: false,
      })
      for(let i=0; i<p_grps.length; i++) {    
        const grpName =  p_grps[i]?.grpName;
        const price = p_grps[i]?.price;
        const limitPerWallet = p_grps[i]?.limitPerWallet;
        const startDate = p_grps[i]?.startDate;
        if (grpName) {
            embed.addField({
                name: '',
                value: ''+grpName+' - '+price+' SEI - '+limitPerWallet+' - <t:'+startDate+'>',
                inline: false,
          })
        }
      }
      embed.addField({
        name: 'Collection ID',
        value: '```'+p_collection+'```',
        inline: false,
      })

    hook.addEmbed(embed).send();
  } catch(e) {
    console.log("Collection -> "+p_collection);
    console.log("Error to send Discord! -> "+e);
  }
  
}

function newMinted(p_collName: string, p_hash: string, p_walletName: string, p_network: string) {
  try {
    const hook = new Webhook(minted_webhook);
    let embed = new Embed();
    embed
      .setTitle('Successful Mint!')
      .setColor('#e86d82')
      .setAuthor({
        name: 'KoD Bot',
        icon_url:
          'https://i.ibb.co/ZLqGrFy/295570317-426126936220968-1116765690902656103-n.jpg',
        url: 'https://discord.gg/DWkv4k7D',
      })
      .setFooter({
        text: 'Enviado',
        icon_url:
          'https://i.ibb.co/ZLqGrFy/295570317-426126936220968-1116765690902656103-n.jpg',
      })
      .setTimestamp()
      .addField({
        name: 'Nome',
        value: ''+p_collName,
        inline: true,
      })
      .addField({
        name: 'Hash',
        value: '[Link](https://www.seiscan.app/'+p_network+'/txs/'+p_hash+')',
        inline: true,
      })
      .addField({
        name: 'Wallet Minted',
        value: ''+p_walletName,
        inline: false,
      })

    hook.addEmbed(embed).send();
  } catch(e) {
    console.log("Error to send Discord! -> "+e);
  }
  
}

export { newCollection, newMinted }  

