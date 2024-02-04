import network from "common/config/network.json";

const FRACTO_DB_URL = network.db_server_url;

export class SequenceData {

   static fetch_sequences = (cb) => {
      const url = `${FRACTO_DB_URL}/sequences`
      fetch(url)
         .then(response => response.text())
         .then((str) => {
            const all_sequences = JSON.parse(str)
               .sort((a, b) => a.updated_at > b.updated_at ? -1 : 1)
            console.log("all_sequences", all_sequences)
            cb(all_sequences)
         })
   }

   static save_sequence = (sequence = {}, cb) => {
      const url = sequence.id ? `${FRACTO_DB_URL}/update_sequence` : `${FRACTO_DB_URL}/new_sequence`;
      let data = sequence.name ? {name: sequence.name} : {}
      if (sequence.id) {
         data["id"] = sequence.id
      }
      fetch(url, {
         body: JSON.stringify(data), // data you send.
         headers: {'Content-Type': 'application/json'},
         method: 'POST',
      }).then(function (response) {
         if (response.body) {
            return response.json();
         }
         return ["ok"];
      }).then(function (json_data) {
         cb(json_data)
      });
   }

   static fetch_sequence_steps = (sequence_id,cb) => {
      const url = `${FRACTO_DB_URL}/sequence_steps?sequence_id=${sequence_id}`
      fetch(url)
         .then(response => response.text())
         .then((str) => {
            const sequence_steps = JSON.parse(str)
            console.log("sequence_steps", sequence_steps)
            cb(sequence_steps)
         })
   }

   static save_sequence_step = (sequence_step, cb) => {
      const url = sequence_step.id ? `${FRACTO_DB_URL}/update_sequence_step` : `${FRACTO_DB_URL}/add_sequence_step`;
      const data_keys = Object.keys(sequence_step)
      const encoded_params = data_keys.map(key => {
         return `${key}=${sequence_step[key]}`
      })
      const data_url = `${url}?${encoded_params.join('&')}`
      console.log("save_sequence_step data_url", data_url)
      fetch(data_url, {
         body: JSON.stringify(sequence_step), // data you send.
         headers: {'Content-Type': 'application/json'},
         method: 'POST',
      }).then(function (response) {
         if (response.body) {
            return response.json();
         }
         return ["ok"];
      }).then(function (json_data) {
         cb(json_data)
      });
   }

}

export default SequenceData
