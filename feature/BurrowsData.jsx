import network from "common/config/network.json";

const FRACTO_DB_URL = network.db_server_url;

export class BurrowsData {

   static fetch_burrows = (cb) => {
      const url = `${FRACTO_DB_URL}/burrows`
      fetch(url)
         .then(response => response.text())
         .then((str) => {
            const all_burrows = JSON.parse(str)
               .sort((a, b) => b.name - a.name)
            console.log("all_burrows", all_burrows)
            cb(all_burrows)
         })
         .catch(e => {
            cb([])
         })
   }
}

export default BurrowsData;
