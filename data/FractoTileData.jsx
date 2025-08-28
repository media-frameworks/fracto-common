import axios from "axios";
import {Buffer} from "buffer";
import FractoIndexedTiles, {TILE_SET_INDEXED} from "./FractoIndexedTiles";
import network from "../../../common/config/network.json";

const TIMEOUT_MS = 100
const FRACTO_PROD = network["fracto-prod"];
const AXIOS_CONFIG = {
   responseType: 'blob',
   headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Access-Control-*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
   },
   mode: 'no-cors',
   crossdomain: true,
}

export const get_manifest = async (on_update, on_complete) => {
   const url = `${FRACTO_PROD}/manifest/tiles/${TILE_SET_INDEXED}/packet_manifest.json`
   try {
      const response = await axios.get(url, AXIOS_CONFIG);
      const blob = new Blob([response.data], {type: 'application/gzip'});
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ascii = Buffer.from(buffer, 'ascii');
      const tile_manifest = JSON.parse(ascii.toString());
      const packet_count = tile_manifest.packet_files.length
      const tile_count = tile_manifest.tile_count
      tile_manifest.packet_files.forEach((manifest_file, packet_index) => {
         load_packet(packet_index, on_update, on_complete)
         if (on_update) {
            on_update({manifest_file, packet_index, packet_count, tile_count});
         }
      })
      const complete_message = `${TILE_SET_INDEXED} tile set load complete`
      console.log(complete_message)
      on_complete(complete_message)
   } catch (e) {
      console.log('error in get_manifest()', e);
   }
}

const load_packet = async (manifest_file, on_update, on_complete) => {
   const url = `${FRACTO_PROD}/manifest/tiles/${TILE_SET_INDEXED}/${manifest_file}`
   try {
      const response = await axios.get(url, AXIOS_CONFIG);
      const blob = new Blob([response.data], {type: 'application/gzip'});
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ascii = Buffer.from(buffer, 'ascii');
      const packet_data = JSON.parse(ascii.toString());
      const level = packet_data.level
      this.setState({loading_level: level})
      FractoIndexedTiles.integrate_tile_packet(TILE_SET_INDEXED, packet_data)
   } catch (e) {
      console.log('error in get_manifest()', e);
   }
}
