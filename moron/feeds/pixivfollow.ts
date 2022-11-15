import { Client, EmbedBuilder, TextBasedChannel } from "discord.js";
import { Logger, WarningLevel } from "../logger";

const logger:Logger = new Logger("feeds/pixivfollow", WarningLevel.Notice);

let client:Client;

export function init_pixivfollow(clientInstance:Client) {
    client = clientInstance;

    // pixiv api set up here
}

// start by using the api to make one enembed that it sends

export async function check_pixivfollow() {
    // pixiv api stuff here

    // code here

    // end pixiv api

    /*(client.channels.resolve("1041979716753690738") as TextBasedChannel).send({
        content:"hi"
    })*/
    await (client.channels.resolve("1041979716753690738") as TextBasedChannel).send({
        embeds:[
            new EmbedBuilder()
            .setTitle("dsfdfg")
            .setURL("https://www.digipen.edu") 
            .setImage("https://i.pximg.net/img-master/img/2022/11/15/00/07/53/102799828_p0_master1200.jpg") // https://i.pximg.net/img-master/img/2022/11/15/00/07/53/102799828_p0_master1200.jpg
            .setAuthor({
                name:"test",
                url: "https://www.digipen.edu",
                iconURL: "https://www.pixiv.net/favicon.ico"
            })
            .setTimestamp(new Date() /* or just pass in time stamp */) // sets to current time
            .setFooter({
                text: "feeter",
                iconURL: "https://www.pixiv.net/favicon.ico"
            })
        ]
    })
}
