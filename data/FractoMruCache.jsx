import StoreS3 from 'common/system/StoreS3';

const MAX_TILE_CACHE = 350;

const URL_BASE = "http://dev.mikehallstudio.com/fracto/fracto-server";

export class FractoMruCache {

   static tile_cache = {};
   static cache_mru = {};
   static highest_mru = 0;

   static get_tile_data = (short_code, cb) => {
      FractoMruCache.cache_mru[short_code] = FractoMruCache.highest_mru++;
      if (!FractoMruCache.tile_cache[short_code]) {
         const filepath = `tiles/256/indexed/${short_code}.json`
         StoreS3.get_file_async(filepath, "fracto", data => {
            console.log("StoreS3.get_file_async", filepath);
            if (!data) {
               console.log("data error");
               cb(false);
            } else {
               const tile_data = JSON.parse(data);
               FractoMruCache.tile_cache[short_code] = tile_data;
               cb(tile_data)
            }
         }, false)
      } else {
         cb(FractoMruCache.tile_cache[short_code])
      }

   }

   static fetch_chunk = (filtered_list, cb) => {
      const chunkSize = 25;
      const chunk = []
      for (let i = 0; i < chunkSize; i++) {
         if (!filtered_list.length) {
            break;
         }
         chunk.push(filtered_list.shift());
      }
      // console.log(`chunk size: ${chunk.length}`)
      const short_code_list = chunk.join(',')
      const url = `${URL_BASE}/get_tiles.php?short_codes=${short_code_list}`
      fetch(url)
         .then(response => response.json())
         .then(json => {
            const keys = Object.keys(json["tiles"])
            for (let i = 0; i < keys.length; i++) {
               const short_code = keys[i];
               FractoMruCache.tile_cache[short_code] = json["tiles"][short_code];
            }
            if (filtered_list.length) {
               FractoMruCache.fetch_chunk(filtered_list, cb)
            }
            else {
               cb(true);
               FractoMruCache.cleanup_cache();
            }
         })
   }

   static get_tiles_async = (short_codes, cb) => {
      // console.log(`requesting ${short_codes.length} tiles`)
      for (let i = 0; i < short_codes.length; i++) {
         FractoMruCache.cache_mru[short_codes[i]] = FractoMruCache.highest_mru++;
      }
      const filtered_list = short_codes.filter(short_code => !FractoMruCache.tile_cache[short_code])
      if (!filtered_list.length) {
         cb(true)
         return;
      }
      // console.log(`chunking ${filtered_list.length} tiles`)
      FractoMruCache.fetch_chunk(filtered_list, cb)
   }

   static cleanup_cache = () => {
      const cache_keys = Object.keys(FractoMruCache.tile_cache).sort((a, b) =>
         FractoMruCache.cache_mru[a] - FractoMruCache.cache_mru[b])
      // console.log(`cleanup_cache ${cache_keys.length} tiles in cache`)
      const keys_to_delete = cache_keys.length - MAX_TILE_CACHE;
      if (keys_to_delete < 1) {
         return;
      }
      console.log(`deleting ${keys_to_delete} tiles from cache`)
      for (let key_index = 0; key_index < keys_to_delete; key_index++) {
         const short_code = cache_keys[key_index];
         // console.log(`delete tile with mru ${FractoMruCache.cache_mru[short_code]}`)
         delete FractoMruCache.tile_cache[short_code]
      }
   }

}

export default FractoMruCache

