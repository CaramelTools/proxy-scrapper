import { Sequelize, TEXT } from "Sequelize";
import axios from "axios";

const seq = new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: `${process.cwd()}/database/db.sqlite`
});

defineModel();

scrapProxies();

function defineModel() {
    seq.define("proxies", {
        proxy: TEXT
    });

    seq.sync();
}

async function scrapProxies() {
    const rawProxies = ["https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt"];
    let proxiesData: string[] = [];
    let proxiesDataSplit: any;

    const totalProcessed = {
        totalSkipped: 0,
        totalAdded: 0
    }

    for (let i = 0; i < rawProxies.length; i++) {
        const fetchedData = await axios.get(rawProxies[i]);
        proxiesData.push(fetchedData.data);
    }

    for (let x = 0; x < proxiesData.length; x++) {
        proxiesDataSplit = proxiesData[x].split("\n");
    }

    for (let y = 0; y < proxiesDataSplit.length; y++) {
        const noPort = proxiesDataSplit[y].split(":")[0];

        const result = await seq.model("proxies").findAll({
            where: {
                proxy: noPort
            },

            limit: 1
        });

        if (result[0] == undefined) {
            seq.model("proxies").create({
                proxy: noPort
            });

            totalProcessed.totalAdded += 1;
        } else {
            totalProcessed.totalSkipped += 1;
        }
    }

    console.log(`
    👍 Added ${totalProcessed.totalAdded} new proxies.
    🔥 Skipped ${totalProcessed.totalSkipped} proxies.
    `);
}
