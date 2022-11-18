import { Client, EmbedBuilder, TextBasedChannel } from "discord.js";
import { Logger, WarningLevel } from "../logger";
import Pixiv from "pixiv.ts"

// https://www.npmjs.com/package/pixiv.ts

const logger:Logger = new Logger("feeds/pixivfollow", WarningLevel.Notice);

let client:Client;

let pixiv:Pixiv;

export async function init_pixivfollow(clientInstance:Client) {
    client = clientInstance;

    // pixiv api set up here
    pixiv = await Pixiv.refreshLogin("FKy0twEEEgJSVpPKlJ3UmfreN_gty2DGsMrV40zyxcc");
}

// start by using the api to make one enembed that it sends

export async function check_pixivfollow() {
    // pixiv api stuff here
    const link:string = "https://www.pixiv.net/en/artworks/102721150"

    // code here
    const illust = await pixiv.illust.get(link)
    
    if (illust.url && illust.create_date && illust.image_urls
        && illust.image_urls["large"] && illust.title && illust.user.name
        && illust.user.profile_image_urls["medium"]) {
        // end pixiv api
        console.log(illust.user.profile_image_urls["medium"])

        let authorURL:string = "https://www.pixiv.net/en/users/" + illust.user.id;

        /*(client.channels.resolve("1041979716753690738") as TextBasedChannel).send({
            content:"hi"
        })*/

        // square_medium: medium: large:

        let imgurl:string = illust.image_urls["medium"];

        await (client.channels.resolve("1041979716753690738") as TextBasedChannel).send({
            embeds:[
                new EmbedBuilder()
                .setTitle(illust.title)
                .setURL(link) 
                .setImage(imgurl)
                .setAuthor({
                    name: illust.user.name,
                    url: authorURL,
                    iconURL: illust.user.profile_image_urls["medium"]
                })
                .setTimestamp(new Date(illust.create_date)) //new Date() /* or just pass in time stamp */) // sets to current time
                .setFooter({
                    text: "pixiv",
                    iconURL: "https://dl2.boxcloud.com/api/2.0/internal_files/859328305780/versions/922575125380/representations/png_paged_2048x2048/content/1.png?access_token=1!hZgdrL0skZqmMbX2ejlD4VEwDdrS4kawCSeVfva9wODJmmEd-hlfVxEhFiTUeFiSFR8GuEx8d2jW3nyj7oUnNRsB8BxwMYAJck1m208wBpW2nDqz66DvXs6MRU1Sxnn3hw-17f3zRXzNrbXLcgsIo-5ogjI335ABydXjkEen6zNTVRe88jevcsZJI8jgcws-Qu_JKMFJbfiJMypFaS8ii1knEOxMO30ziTQZtPIvt9UtXHcqroKgPdqUH22r2RuWOY6omkhKwuZ8OPVRai3_btB4060_9kO6ppf6o3CXuxvpqCCqDrLwYyF66s8sEOhSSSqM70F8gCH_hnP3eKBEx2Qa9yJSBT4xfUhyATpa5YfkA0f-iG30zMJMiwVVZ5wxhp0UVIAo_FWLxx3aJ0PtAL7f1UpUbsDMCjatOUvSkcjwNEPBq1rWvTFfmGO2mwHMWRab_TjwkvE6ZxMTHndRRIq9yT-FVEPv7NMvnqfmX0P2bROEPOAEnMXMjoGyoXlgvNP6n8sJTMjBYtwpUqd4cI5U8N9xM2HwNjNS3OoAuTy3d1VNzHSTzl9vSwA8mSF0pfRY&shared_link=https%3A%2F%2Fpixiv1.app.box.com%2Fs%2Fck1wmu9uhzewhlabsevw0gxojskmhgcx&box_client_name=box-content-preview&box_client_version=2.85.1",
                })
            ]
        })
    }
}
