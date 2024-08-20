import network from "common/config/network.json";
import FractoUtil from "../FractoUtil";
import {get_ideal_level} from "../data/FractoData";

const FRACTO_DB_URL = network.db_server_url;

const BAILIWICK_MAX_SIZE = 4096;
const BAILIWICK_SIZE_PX = 650;

export class BailiwickData {

   static fetch_bailiwicks = (cb) => {
      const url = `${FRACTO_DB_URL}/free_bailiwicks`
      fetch(url)
         .then(response => response.text())
         .then((str) => {
            const all_bailiwicks = JSON.parse(str)
               .sort((a, b) => b.magnitude - a.magnitude)
               .map((c, i) => {
                  c.free_ordinal = i
                  return c
               })
               .sort((e, d) => d.updated_at > e.updated_at ? -1 : 1)
            console.log("all_bailiwicks", all_bailiwicks)
            cb(all_bailiwicks)
         })
         .catch(e => {
            console.log('error fetching bailiwicks', e.message)
            cb([])
         })
   }

   static fetch_node_points = (cb) => {
      const url = `${FRACTO_DB_URL}/node_points`
      fetch(url)
         .then(response => response.text())
         .then((str) => {
            const node_points = JSON.parse(str)
            // console.log("node_points", node_points)
            cb(node_points)
         })
         .catch(e => {
            cb([])
         })
   }

   static save_bailiwick = (bailiwick, bailiwick_index, cb) => {
      const url = bailiwick.id ? `${FRACTO_DB_URL}/update_free_bailiwick` : `${FRACTO_DB_URL}/new_free_bailiwick`;
      const highest_level = get_ideal_level(BAILIWICK_MAX_SIZE, bailiwick.display_settings.scope, 1.5);
      const bailiwick_name = FractoUtil.bailiwick_name(bailiwick.pattern, bailiwick.core_point, highest_level)
      const cq_code = FractoUtil.CQ_code_from_point(bailiwick.core_point.x, bailiwick.core_point.y)
      const display_level = get_ideal_level(BAILIWICK_SIZE_PX, bailiwick.display_settings.scope, 2.5);
      const data = {
         name: bailiwick_name,
         CQ_code: cq_code.slice(0, 25),
         pattern: bailiwick.pattern,
         best_level: display_level,
         free_ordinal: bailiwick_index + 1,
         magnitude: bailiwick.magnitude,
         core_point: JSON.stringify(bailiwick.core_point),
         octave_point: JSON.stringify(bailiwick.octave_point),
         display_settings: JSON.stringify(bailiwick.display_settings),
         registry_filename: bailiwick.registry_filename,
         updated_at: 'CURRENT_TIMESTAMP'
      }
      if (bailiwick.id) {
         data.id = bailiwick.id
      }
      const data_keys = Object.keys(data)
      const encoded_params = data_keys.map(key => {
         return `${key}=${data[key]}`
      })
      const data_url = `${url}?${encoded_params.join('&')}`
      fetch(data_url, {
         body: JSON.stringify(data), // data you send.
         headers: {'Content-Type': 'application/json'},
         method: 'POST',
         mode: 'no-cors', // no-cors, cors, *same-origin
      }).then(function (response) {
         if (response.body) {
            return response.json();
         }
         return ["ok"];
      }).then(function (json_data) {
         console.log("save_bailiwick", url, json_data)
         cb(`saved ${bailiwick.name}`)
      });
   }

   static save_node_point = (node_point, bailiwick_id, root, cb) => {
      const url = node_point.id ? `${FRACTO_DB_URL}/update_node_point` : `${FRACTO_DB_URL}/new_node_point`;
      const location = {x: node_point.x, y: node_point.y}
      console.log("save_node_point location, url", location, url)
      const cq_code = FractoUtil.CQ_code_from_point(location.x, location.y)
      const name = `N${node_point.pattern}-CP${cq_code.substr(0, 20)}`
      let data = {
         bailiwick_id: bailiwick_id,
         pattern: node_point.pattern,
         iteration: node_point.iteration,
         location: JSON.stringify(location),
         cq_code: cq_code.slice(0, 35),
         name: name,
         short_form: FractoUtil.fracto_designation(root, node_point.pattern, true),
         long_form: FractoUtil.fracto_designation(root, node_point.pattern, false),
      }
      if (node_point.id) {
         data.id = node_point.id
      }
      const data_keys = Object.keys(data)
      const encoded_params = data_keys.map(key => {
         return `${key}=${data[key]}`
      })
      const data_url = `${url}?${encoded_params.join('&')}`
      console.log("save_node_point data_url", data_url)
      fetch(data_url, {
         body: JSON.stringify(data), // data you send.
         headers: {'Content-Type': 'application/json'},
         method: 'POST',
         mode: 'no-cors', // no-cors, cors, *same-origin
      }).then(function (response) {
         if (response.body) {
            return response.json();
         }
         return ["ok"];
      }).then(function (json_data) {
         console.log("save_node_point", data_url, json_data)
         cb(`saved bailiwick id# ${bailiwick_id}`)
      });
   }

   static delete_node_point = (node_point_id, cb) => {
      const url = `${FRACTO_DB_URL}/delete_node_point?node_point_id=${node_point_id}`;
      fetch(url, {
         body: '{}', // data you send.
         headers: {'Content-Type': 'application/json'},
         method: 'POST',
         mode: 'no-cors', // no-cors, cors, *same-origin
      }).then(function (response) {
         if (response.body) {
            return response.json();
         }
         return ["ok"];
      }).then(function (json_data) {
         console.log("delete_node_point", url, json_data)
         cb(`deleted node point ${node_point_id}`)
      });
   }
}

export default BailiwickData;
