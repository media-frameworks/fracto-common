import network from "common/config/network.json";
import {Buffer} from 'buffer';
import {decompressSync} from 'fflate';

const URL_BASE = network.fracto_server_url;
const TILE_SERVER_BASE = network.tile_server_url;
const MAX_TILE_CACHE = 500;

export var TILE_CACHE = {};
export var PACKAGE_CACHE = {};
var CACHE_MRU = {};

setInterval(() => {
   FractoMruCache.cleanup_cache();
}, 10000)

export class FractoMruCache {

   static highest_mru = 0;

   static serialize_tile = (data) => {
      return data
   }

   static deserialize_tile = (data) => {
      return data
   }

   static get_tile_data_raw = (short_code, cb) => {
      CACHE_MRU[short_code] = FractoMruCache.highest_mru++;
      if (!(short_code in TILE_CACHE)) {
         // console.log(`loading tile ${short_code}`)
         const url = `${URL_BASE}/get_tiles.php?short_codes=${short_code}`
         fetch(url).then(response => {
            // console.log("response", response)
            return response.json()
         }).then(json => {
            // console.log("json", json)
            if (!json["tiles"]) {
               cb(null)
            } else {
               TILE_CACHE[short_code] = FractoMruCache.serialize_tile(json["tiles"][short_code])
               cb(json["tiles"][short_code])
            }
         })
      } else {
         // console.log(`cached tile ${short_code}`)
         const tile_data = FractoMruCache.deserialize_tile(TILE_CACHE[short_code])
         cb(tile_data)
      }
   }

   static get_tile_data = (short_code, cb) => {
      CACHE_MRU[short_code] = FractoMruCache.highest_mru++;
      if (!(short_code in TILE_CACHE)) {
         const packages_url = `${TILE_SERVER_BASE}/get_packages?short_codes=${short_code}`
         fetch(packages_url)
            .then(response => response.json())
            .then(json => {
               const keys = Object.keys(json["packages"])
               if (!keys.length) {
                  console.log('error in package', short_code)
                  FractoMruCache.get_tile_data_raw(short_code, cb)
               } else {
                  const buffer = Buffer.from(json["packages"][short_code], 'base64');
                  const decompressed = decompressSync(buffer);
                  const buf = Buffer.from(decompressed, 'ascii');
                  const tile_data = JSON.parse(buf.toString())
                  // console.log("tile_data", tile_data)
                  TILE_CACHE[short_code] = tile_data
                  cb(tile_data)
               }
            })

      } else {
         // console.log(`cached tile ${short_code}`)
         const tile_data = FractoMruCache.deserialize_tile(TILE_CACHE[short_code])
         cb(tile_data)
      }
   }

   static fetch_chunk = (filtered_list, cb) => {
      const chunkSize = 100;
      const chunk = []
      for (let i = 0; i < chunkSize; i++) {
         if (!filtered_list.length) {
            break;
         }
         chunk.push(filtered_list.shift());
      }
      // console.log(`chunk size: ${chunk.length}`)
      const short_code_list = chunk.join(',')
      const packages_url = `${TILE_SERVER_BASE}/get_packages?short_codes=${short_code_list}`
      fetch(packages_url)
         .then(response => response.json())
         .then(json => {
            const keys = Object.keys(json["packages"])
            for (let i = 0; i < keys.length; i++) {
               const short_code = keys[i];
               const buffer = Buffer.from(json["packages"][short_code], 'base64');
               const decompressed = decompressSync(buffer);
               const buf = Buffer.from(decompressed, 'ascii');
               const tile_data = JSON.parse(buf.toString())
               TILE_CACHE[short_code] = FractoMruCache.serialize_tile(tile_data);
            }
            if (filtered_list.length) {
               FractoMruCache.fetch_chunk(filtered_list, cb)
            } else {
               cb(true);
            }
         })
   }

   static get_tiles_async = (short_codes, cb) => {
      // console.log(`requesting ${short_codes.length} tiles`)
      for (let i = 0; i < short_codes.length; i++) {
         CACHE_MRU[short_codes[i]] = FractoMruCache.highest_mru++;
      }
      const filtered_list = short_codes.filter(short_code => !TILE_CACHE[short_code])
      if (!filtered_list.length) {
         cb(true)
         return;
      }
      console.log(`chunking ${filtered_list.length} tiles`)
      FractoMruCache.fetch_chunk(filtered_list, cb)
   }

   static cleanup_cache = () => {
      const cache_keys = Object.keys(TILE_CACHE).sort((a, b) =>
         CACHE_MRU[a] - CACHE_MRU[b])
      if (cache_keys.length < MAX_TILE_CACHE) {
         // console.log("no cleanup required")
         return;
      }
      // console.log(`cleanup_cache ${cache_keys.length} tiles in cache`)
      const keys_to_delete = cache_keys.length - 100;
      // console.log(`deleting ${keys_to_delete} tiles from cache`)
      for (let key_index = 0; key_index < keys_to_delete; key_index++) {
         const short_code = cache_keys[key_index];
         // console.log(`delete tile with mru ${CACHE_MRU[short_code]}`)
         delete CACHE_MRU[short_code]
         delete TILE_CACHE[short_code]
      }
      const new_cache = Object.assign({}, TILE_CACHE)
      TILE_CACHE = null
      TILE_CACHE = new_cache
   }

}

export default FractoMruCache

