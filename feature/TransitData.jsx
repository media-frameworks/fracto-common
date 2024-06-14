import network from "common/config/network.json";

export class TransitData {

   static add_image = (img_data, img_index, video_id, cb) => {
      const url = `${network.video_server_url}/add_frame`
      fetch(url, {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({
            file: img_data,
            video_id: video_id,
            img_index: img_index
         }),
      })
         .then(response => response.text())
         .then((str) => {
            const response = JSON.parse(str)
            console.log("response", response)
            cb(response)
         })
   }

}

export default TransitData;
