
import FractoData, {
   BIN_VERB_INDEXED,
   BIN_VERB_COMPLETED,
   BIN_VERB_READY,
   BIN_VERB_INLAND,
   BIN_VERB_POTENTIALS,
   BIN_VERB_ERROR,
} from "./FractoData"

const URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";

const COMPLETED_TILES_URL = `${URL_BASE}/directory/complete.csv`;
const POTENTIALS_TILES_URL = `${URL_BASE}/directory/new.csv`;
const READY_TILES_URL = `${URL_BASE}/directory/ready.csv`;
const INLAND_TILES_URL = `${URL_BASE}/directory/inland.csv`;
const INDEXED_TILES_URL = `${URL_BASE}/directory/indexed.csv`;
const ERROR_TILES_URL = `${URL_BASE}/directory/error.csv`;

export const TILE_SET_LOADING = "tile_set_loading";
export const TILE_SET_LOADED = "tile_set_loaded";
export const TILE_SET_PROBLEM = "tile_set_problem";

export class FractoDataLoader {

   static loading_sets = [];
   static loaded_sets = [];

   static load_tile_set_async = (bin_verb, cb) => {
      if (FractoDataLoader.loaded_sets.includes(bin_verb)) {
         cb(TILE_SET_LOADED);
         return;
      }
      if (FractoDataLoader.loading_sets.includes(bin_verb)) {
         cb(TILE_SET_LOADING);
         return;
      }
      FractoDataLoader.loading_sets.push(bin_verb)
      switch (bin_verb) {
         case BIN_VERB_COMPLETED:
            FractoData.fetch_bin_async(COMPLETED_TILES_URL, BIN_VERB_COMPLETED, result => {
               console.log("FractoData.fetch_bin_async", BIN_VERB_COMPLETED, result)
               FractoDataLoader.loaded_sets.push(bin_verb)
               cb(TILE_SET_LOADED);
            })
            break;
         case BIN_VERB_INDEXED:
            FractoData.fetch_bin_async(INDEXED_TILES_URL, BIN_VERB_INDEXED, result => {
               console.log("FractoData.fetch_bin_async", BIN_VERB_INDEXED, result)
               FractoDataLoader.loaded_sets.push(bin_verb)
               cb(TILE_SET_LOADED);
            })
            break;
         case BIN_VERB_POTENTIALS:
            FractoData.fetch_bin_async(POTENTIALS_TILES_URL, BIN_VERB_POTENTIALS, result => {
               console.log("FractoData.fetch_bin_async", BIN_VERB_POTENTIALS, result)
               FractoDataLoader.loaded_sets.push(bin_verb)
               cb(TILE_SET_LOADED);
            })
            break;
         case BIN_VERB_READY:
            FractoData.fetch_bin_async(READY_TILES_URL, BIN_VERB_READY, result => {
               console.log("FractoData.fetch_bin_async", BIN_VERB_READY, result)
               FractoDataLoader.loaded_sets.push(bin_verb)
               cb(TILE_SET_LOADED);
            })
            break;
         case BIN_VERB_INLAND:
            FractoData.fetch_bin_async(INLAND_TILES_URL, BIN_VERB_INLAND, result => {
               console.log("FractoData.fetch_bin_async", BIN_VERB_INLAND, result)
               FractoDataLoader.loaded_sets.push(bin_verb)
               cb(TILE_SET_LOADED);
            })
            break;
         case BIN_VERB_ERROR:
            FractoData.fetch_bin_async(ERROR_TILES_URL, BIN_VERB_ERROR, result => {
               console.log("FractoData.fetch_bin_async", BIN_VERB_ERROR, result)
               FractoDataLoader.loaded_sets.push(bin_verb)
               cb(TILE_SET_LOADED);
            })
            break;
         default:
            console.log("unknown bin verb", bin_verb)
            cb(TILE_SET_PROBLEM)
            break;
      }

   }

}

export default FractoDataLoader;
