import {Component} from 'react';

import FractoUtil from "../FractoUtil"
import network from "../../../common/config/network.json";

export const MAX_LEVEL = 35;

const LEVEL_SCOPES = []

export const BIN_VERB_INDEXED = "indexed";
export const BIN_VERB_COMPLETED = "completed";
export const BIN_VERB_READY = "ready";
export const BIN_VERB_INLAND = "inland";
export const BIN_VERB_POTENTIALS = "potentials";
export const BIN_VERB_ERROR = "error";

for (let level = 0; level < MAX_LEVEL; level++) {
   LEVEL_SCOPES[level] = {}
   LEVEL_SCOPES[level]["scope"] = Math.pow(2, 1 - level);
   LEVEL_SCOPES[level][BIN_VERB_COMPLETED] = {};
   LEVEL_SCOPES[level][BIN_VERB_POTENTIALS] = {};
   LEVEL_SCOPES[level][BIN_VERB_READY] = {};
   LEVEL_SCOPES[level][BIN_VERB_INLAND] = {};
   LEVEL_SCOPES[level][BIN_VERB_INDEXED] = {};
   LEVEL_SCOPES[level][BIN_VERB_ERROR] = {};
}

export const get_ideal_level = (width_px, scope, quality_factor = 1.99) => {

   const ideal_tiles_across = Math.ceil(quality_factor * width_px / 256);
   const ideal_tile_scope = scope / ideal_tiles_across;

   let ideal_level = -1;
   for (let i = 0; i <= MAX_LEVEL; i++) {
      if (LEVEL_SCOPES[i].scope < ideal_tile_scope) {
         ideal_level = i;
         break;
      }
   }
   return ideal_level;
}

export const GET_COMPLETED_TILES_ONLY = 1;
export const GET_EMPTY_TILES_ONLY = 2;
export const GET_ALL_TILES = 3;
export const HIGH_QUALITY = 4;

export const get_level_scope = (level) => {
   return LEVEL_SCOPES[level].scope;
}

const URL_BASE = network.dev_server_url;
const BIN_COUNTS_URL = `${URL_BASE}/directory/bin_counts.json`;

export class FractoData extends Component {

   static loading_progress_pct = {
      BIN_VERB_INDEXED: 0,
      BIN_VERB_COMPLETED: 0,
      BIN_VERB_READY: 0,
      BIN_VERB_INLAND: 0,
      BIN_VERB_POTENTIALS: 0,
      BIN_VERB_ERROR: 0,
   }

   static fetch_bin_async = (url, verb, cb) => {
      console.log(`fetching ${verb} tiles...`, url)
      fetch(url)
         .then(response => response.text())
         .then(csv => {
            const lines = csv.split("\n");
            // console.log(`${verb} tiles loaded`, lines.length)
            for (let line_index = 1; line_index < lines.length; line_index++) {
               const values = lines[line_index].split(',');
               const short_code = String(values[0]);
               const level = short_code.length;
               if (LEVEL_SCOPES[level]) {
                  LEVEL_SCOPES[level][verb][short_code] = {
                     left: parseFloat(values[1]),
                     top: parseFloat(values[2]),
                     right: parseFloat(values[3]),
                     bottom: parseFloat(values[4]),
                  }
               }
               FractoData.loading_progress_pct[verb] = Math.round(1000 * line_index / lines.length) / 10;
            }
            // console.log(`${verb} tiles parsed`)
            cb(true);
         })
   }

   static load_bin_counts_async = (cb) => {
      console.log(`loading bin counts`)
      fetch(BIN_COUNTS_URL)
         .then(response => response.json())
         .then(json => {
            cb(json);
         })
   }

   static tiles_in_scope = (level, focal_point, scope, aspect_ratio = 1.0, verbs = [BIN_VERB_COMPLETED, BIN_VERB_INDEXED]) => {
      const width_by_two = scope / 2;
      const height_by_two = width_by_two * aspect_ratio;
      const viewport = {
         left: focal_point.x - width_by_two,
         top: focal_point.y + height_by_two,
         right: focal_point.x + width_by_two,
         bottom: focal_point.y - height_by_two,
      }
      let all_tiles = {}
      verbs.forEach(verb => {
         FractoData.get_cached_tiles(level, verb)
         const tiles_to_add = LEVEL_SCOPES[level][verb];
         all_tiles = Object.assign(all_tiles, tiles_to_add)
      })
      const level_keys = Object.keys(all_tiles)
      // console.log(`${level_keys.length} tiles for level ${level}`)
      const filtered_keys = level_keys.filter(key => {
         const bounds = FractoUtil.bounds_from_short_code(key) //all_tiles[key];
         if (bounds.right < viewport.left) {
            return false;
         }
         if (bounds.left > viewport.right) {
            return false;
         }
         if (bounds.top < viewport.bottom) {
            return false;
         }
         if (bounds.bottom > viewport.top) {
            return false;
         }
         return true;
      })
      return filtered_keys.map(key => {
         return {
            short_code: key,
            bounds: FractoUtil.bounds_from_short_code(key)
         }
      })
   }

   static tiles_cache = {}

   static get_tile = (short_code, bin) => {
      const level = short_code.length;
      return LEVEL_SCOPES[level][bin][short_code]
   }

   static get_cached_tiles = (level, verb) => {
      const cache_key = `${verb}_${level}`;
      if (!FractoData.tiles_cache[cache_key]) {
         // console.log(`building cache for ${verb} tiles on level ${level}`)
         if (!LEVEL_SCOPES[level]) {
            console.log("get_cached_tiles error LEVEL_SCOPES, level", LEVEL_SCOPES, level)
            return null;
         }
         const level_keys = Object.keys(LEVEL_SCOPES[level][verb]);
         FractoData.tiles_cache[cache_key] = level_keys.map(key => {
            return {
               short_code: key,
               bounds: FractoUtil.bounds_from_short_code(key)
            }
         }).sort((a, b) => {
            return a.bounds.left === b.bounds.left ?
               (a.bounds.top > b.bounds.top ? -1 : 1) :
               (a.bounds.left > b.bounds.left ? 1 : -1)
         })
      }
      return FractoData.tiles_cache[cache_key]
   }

}

export default FractoData;
