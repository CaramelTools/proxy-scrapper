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

    for (let i = 0; i < rawProxies.length; i++) {
        const fetchedData = await axios.get(rawProxies[i]);
        proxiesData.push(fetchedData.data);
    }

    for (let x = 0; x < proxiesData.length; x++) {
        proxiesDataSplit = proxiesData[x].split("\n");
    }   

    for (let y = 0; y < proxiesDataSplit.length; y++) {
        seq.model("proxies").create({
            proxy: proxiesDataSplit[y]
        });
    }
}