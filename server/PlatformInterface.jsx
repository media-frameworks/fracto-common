import network from "common/config/network.json";

const FRACTO_PHP_URL_BASE = network.fracto_server_url;

class PlatformInterface {

   static get_platform_file_async = (platform, file_prefix, cb) => {
      const url = `${FRACTO_PHP_URL_BASE}/content.php?platform=${platform}&filename=${file_prefix}.json`;
      fetch(url)
         .then(response => response.json())
         .then(json_data => {
            console.log("get_platform_file_async", url, json_data)
            cb(json_data.content)
         })
   }

   static post_platform_file_async = (platform, file_prefix, post_data, cb) => {
      const url = `${FRACTO_PHP_URL_BASE}/content.php`;
      const data = {
         post_data: post_data,
         filename: `${file_prefix}.json`
      }
      fetch(url, {
         body: JSON.stringify(data), // data you send.
         headers: {'Content-Type': 'application/json; charset=UTF-8'},
         method: 'POST',
      }).then(function (response) {
         if (response.body) {
            return response.json();
         }
         return ["fail"];
      }).then(function (json_data) {
         console.log("post_platform_file_async", url, json_data)
         cb(json_data)
      });
   }

}

export default PlatformInterface;
