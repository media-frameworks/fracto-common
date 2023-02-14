import {Component} from 'react';

// import LEVEL_02 from "data/fracto/json_100/level_02_complete.json";
// import LEVEL_03 from "data/fracto/json_100/level_03_complete.json";
// import LEVEL_04 from "data/fracto/json_100/level_04_complete.json";
// import LEVEL_05 from "data/fracto/json_100/level_05_complete.json";
// import LEVEL_06 from "data/fracto/json_100/level_06_complete.json";
// import LEVEL_07 from "data/fracto/json_100/level_07_complete.json";
// import LEVEL_08 from "data/fracto/json_100/level_08_complete.json";
// import LEVEL_09 from "data/fracto/json_100/level_09_complete.json";
// import LEVEL_10 from "data/fracto/json_100/level_10_complete.json";
// import LEVEL_11 from "data/fracto/json_100/level_11_complete.json";
// import LEVEL_12 from "data/fracto/json_100/level_12_complete.json";
// import LEVEL_13 from "data/fracto/json_100/level_13_complete.json";
// import LEVEL_14 from "data/fracto/json_100/level_14_complete.json";
// import LEVEL_15 from "data/fracto/json_100/level_15_complete.json";
// import LEVEL_16 from "data/fracto/json_100/level_16_complete.json";
// import LEVEL_17 from "data/fracto/json_100/level_17_complete.json";
// import LEVEL_18 from "data/fracto/json_100/level_18_complete.json";
// import LEVEL_19 from "data/fracto/json_100/level_19_complete.json";
// import LEVEL_20 from "data/fracto/json_100/level_20_complete.json";
// import LEVEL_21 from "data/fracto/json_100/level_21_complete.json";
// import LEVEL_22 from "data/fracto/json_100/level_22_complete.json";
// import LEVEL_23 from "data/fracto/json_100/level_23_complete.json";
// import LEVEL_24 from "data/fracto/json_100/level_24_complete.json";
// import LEVEL_25 from "data/fracto/json_100/level_25_complete.json";
// import LEVEL_26 from "data/fracto/json_100/level_26_complete.json";
// import LEVEL_27 from "data/fracto/json_100/level_27_complete.json";
// import LEVEL_28 from "data/fracto/json_100/level_28_complete.json";
// import LEVEL_29 from "data/fracto/json_100/level_29_complete.json";
// import LEVEL_30 from "data/fracto/json_100/level_30_complete.json";
// import LEVEL_31 from "data/fracto/json_100/level_31_complete.json";
// import LEVEL_32 from "data/fracto/json_100/level_32_complete.json";
// import LEVEL_33 from "data/fracto/json_100/level_33_complete.json";
// import LEVEL_34 from "data/fracto/json_100/level_34_complete.json";
// import LEVEL_35 from "data/fracto/json_100/level_35_complete.json";
// import LEVEL_36 from "data/fracto/json_100/level_36_complete.json";
// import LEVEL_37 from "data/fracto/json_100/level_37_complete.json";
// import LEVEL_38 from "data/fracto/json_100/level_38_complete.json";
// import LEVEL_39 from "data/fracto/json_100/level_39_complete.json";
// import LEVEL_40 from "data/fracto/json_100/level_40_complete.json";
// import LEVEL_41 from "data/fracto/json_100/level_41_complete.json";
// import LEVEL_42 from "data/fracto/json_100/level_42_complete.json";
// import LEVEL_43 from "data/fracto/json_100/level_43_complete.json";
// import LEVEL_44 from "data/fracto/json_100/level_44_complete.json";
// import LEVEL_45 from "data/fracto/json_100/level_45_complete.json";
// import LEVEL_46 from "data/fracto/json_100/level_46_complete.json";
// import LEVEL_47 from "data/fracto/json_100/level_47_complete.json";
// import LEVEL_48 from "data/fracto/json_100/level_48_complete.json";
// import LEVEL_49 from "data/fracto/json_100/level_49_complete.json";
// import LEVEL_50 from "data/fracto/json_100/level_50_complete.json";
//
// import LEVEL_02_empty from "data/fracto/json_100/level_02_empty.json";
// import LEVEL_03_empty from "data/fracto/json_100/level_03_empty.json";
// import LEVEL_04_empty from "data/fracto/json_100/level_04_empty.json";
// import LEVEL_05_empty from "data/fracto/json_100/level_05_empty.json";
// import LEVEL_06_empty from "data/fracto/json_100/level_06_empty.json";
// import LEVEL_07_empty from "data/fracto/json_100/level_07_empty.json";
// import LEVEL_08_empty from "data/fracto/json_100/level_08_empty.json";
// import LEVEL_09_empty from "data/fracto/json_100/level_09_empty.json";
// import LEVEL_10_empty from "data/fracto/json_100/level_10_empty.json";
// import LEVEL_11_empty from "data/fracto/json_100/level_11_empty.json";
// import LEVEL_12_empty from "data/fracto/json_100/level_12_empty.json";
// import LEVEL_13_empty from "data/fracto/json_100/level_13_empty.json";
// import LEVEL_14_empty from "data/fracto/json_100/level_14_empty.json";
// import LEVEL_15_empty from "data/fracto/json_100/level_15_empty.json";
// import LEVEL_16_empty from "data/fracto/json_100/level_16_empty.json";
// import LEVEL_17_empty from "data/fracto/json_100/level_17_empty.json";
// import LEVEL_18_empty from "data/fracto/json_100/level_18_empty.json";
// import LEVEL_19_empty from "data/fracto/json_100/level_19_empty.json";
// import LEVEL_20_empty from "data/fracto/json_100/level_20_empty.json";
// import LEVEL_21_empty from "data/fracto/json_100/level_21_empty.json";
// import LEVEL_22_empty from "data/fracto/json_100/level_22_empty.json";
// import LEVEL_23_empty from "data/fracto/json_100/level_23_empty.json";
// import LEVEL_24_empty from "data/fracto/json_100/level_24_empty.json";
// import LEVEL_25_empty from "data/fracto/json_100/level_25_empty.json";
// import LEVEL_26_empty from "data/fracto/json_100/level_26_empty.json";
// import LEVEL_27_empty from "data/fracto/json_100/level_27_empty.json";
// import LEVEL_28_empty from "data/fracto/json_100/level_28_empty.json";
// import LEVEL_29_empty from "data/fracto/json_100/level_29_empty.json";
// import LEVEL_30_empty from "data/fracto/json_100/level_30_empty.json";
// import LEVEL_31_empty from "data/fracto/json_100/level_31_empty.json";
// import LEVEL_32_empty from "data/fracto/json_100/level_32_empty.json";
// import LEVEL_33_empty from "data/fracto/json_100/level_33_empty.json";
// import LEVEL_34_empty from "data/fracto/json_100/level_34_empty.json";
// import LEVEL_35_empty from "data/fracto/json_100/level_35_empty.json";
// import LEVEL_36_empty from "data/fracto/json_100/level_36_empty.json";
// import LEVEL_37_empty from "data/fracto/json_100/level_37_empty.json";
// import LEVEL_38_empty from "data/fracto/json_100/level_38_empty.json";
// import LEVEL_39_empty from "data/fracto/json_100/level_39_empty.json";
// import LEVEL_40_empty from "data/fracto/json_100/level_40_empty.json";
// import LEVEL_41_empty from "data/fracto/json_100/level_41_empty.json";
// import LEVEL_42_empty from "data/fracto/json_100/level_42_empty.json";
// import LEVEL_43_empty from "data/fracto/json_100/level_43_empty.json";
// import LEVEL_44_empty from "data/fracto/json_100/level_44_empty.json";
// import LEVEL_45_empty from "data/fracto/json_100/level_45_empty.json";
// import LEVEL_46_empty from "data/fracto/json_100/level_46_empty.json";
// import LEVEL_47_empty from "data/fracto/json_100/level_47_empty.json";
// import LEVEL_48_empty from "data/fracto/json_100/level_48_empty.json";
// import LEVEL_49_empty from "data/fracto/json_100/level_49_empty.json";
// import LEVEL_50_empty from "data/fracto/json_100/level_50_empty.json";
//
// export const MAX_LEVEL = 50;
//
// const LEVEL_SCOPES = [
//    {cells: [], scope: 2.0},
//    {cells: [], scope: 1.0},
//    {cells: LEVEL_02, empties: LEVEL_02_empty, scope: 0.0},
//    {cells: LEVEL_03, empties: LEVEL_03_empty, scope: 0.0},
//    {cells: LEVEL_04, empties: LEVEL_04_empty, scope: 0.0},
//    {cells: LEVEL_05, empties: LEVEL_05_empty, scope: 0.0},
//    {cells: LEVEL_06, empties: LEVEL_06_empty, scope: 0.0},
//    {cells: LEVEL_07, empties: LEVEL_07_empty, scope: 0.0},
//    {cells: LEVEL_08, empties: LEVEL_08_empty, scope: 0.0},
//    {cells: LEVEL_09, empties: LEVEL_09_empty, scope: 0.0},
//    {cells: LEVEL_10, empties: LEVEL_10_empty, scope: 0.0},
//    {cells: LEVEL_11, empties: LEVEL_11_empty, scope: 0.0},
//    {cells: LEVEL_12, empties: LEVEL_12_empty, scope: 0.0},
//    {cells: LEVEL_13, empties: LEVEL_13_empty, scope: 0.0},
//    {cells: LEVEL_14, empties: LEVEL_14_empty, scope: 0.0},
//    {cells: LEVEL_15, empties: LEVEL_15_empty, scope: 0.0},
//    {cells: LEVEL_16, empties: LEVEL_16_empty, scope: 0.0},
//    {cells: LEVEL_17, empties: LEVEL_17_empty, scope: 0.0},
//    {cells: LEVEL_18, empties: LEVEL_18_empty, scope: 0.0},
//    {cells: LEVEL_19, empties: LEVEL_19_empty, scope: 0.0},
//    {cells: LEVEL_20, empties: LEVEL_20_empty, scope: 0.0},
//    {cells: LEVEL_21, empties: LEVEL_21_empty, scope: 0.0},
//    {cells: LEVEL_22, empties: LEVEL_22_empty, scope: 0.0},
//    {cells: LEVEL_23, empties: LEVEL_23_empty, scope: 0.0},
//    {cells: LEVEL_24, empties: LEVEL_24_empty, scope: 0.0},
//    {cells: LEVEL_25, empties: LEVEL_25_empty, scope: 0.0},
//    {cells: LEVEL_26, empties: LEVEL_26_empty, scope: 0.0},
//    {cells: LEVEL_27, empties: LEVEL_27_empty, scope: 0.0},
//    {cells: LEVEL_28, empties: LEVEL_28_empty, scope: 0.0},
//    {cells: LEVEL_29, empties: LEVEL_29_empty, scope: 0.0},
//    {cells: LEVEL_30, empties: LEVEL_30_empty, scope: 0.0},
//    {cells: LEVEL_31, empties: LEVEL_31_empty, scope: 0.0},
//    {cells: LEVEL_32, empties: LEVEL_32_empty, scope: 0.0},
//    {cells: LEVEL_33, empties: LEVEL_33_empty, scope: 0.0},
//    {cells: LEVEL_34, empties: LEVEL_34_empty, scope: 0.0},
//    {cells: LEVEL_35, empties: LEVEL_35_empty, scope: 0.0},
//    {cells: LEVEL_36, empties: LEVEL_36_empty, scope: 0.0},
//    {cells: LEVEL_37, empties: LEVEL_37_empty, scope: 0.0},
//    {cells: LEVEL_38, empties: LEVEL_38_empty, scope: 0.0},
//    {cells: LEVEL_39, empties: LEVEL_39_empty, scope: 0.0},
//    {cells: LEVEL_40, empties: LEVEL_40_empty, scope: 0.0},
//    {cells: LEVEL_41, empties: LEVEL_41_empty, scope: 0.0},
//    {cells: LEVEL_42, empties: LEVEL_42_empty, scope: 0.0},
//    {cells: LEVEL_43, empties: LEVEL_43_empty, scope: 0.0},
//    {cells: LEVEL_44, empties: LEVEL_44_empty, scope: 0.0},
//    {cells: LEVEL_45, empties: LEVEL_45_empty, scope: 0.0},
//    {cells: LEVEL_46, empties: LEVEL_46_empty, scope: 0.0},
//    {cells: LEVEL_47, empties: LEVEL_47_empty, scope: 0.0},
//    {cells: LEVEL_48, empties: LEVEL_48_empty, scope: 0.0},
//    {cells: LEVEL_49, empties: LEVEL_49_empty, scope: 0.0},
//    {cells: LEVEL_50, empties: LEVEL_50_empty, scope: 0.0},
// ];

export const MAX_LEVEL = 50;

const LEVEL_SCOPES = []

for (let level = 0; level < MAX_LEVEL; level++) {
   LEVEL_SCOPES[level] = {}
   LEVEL_SCOPES[level]["scope"] = Math.pow(2, 1 - level);
   LEVEL_SCOPES[level]["completed"] = {};
   LEVEL_SCOPES[level]["potentials"] = {};
   LEVEL_SCOPES[level]["ready"] = {};
   LEVEL_SCOPES[level]["indexed"] = {};
   LEVEL_SCOPES[level]["error"] = {};
}
console.log("LEVEL_SCOPES", LEVEL_SCOPES)

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

// const cached_level_tiles = {};

export const GET_COMPLETED_TILES_ONLY = 1;
export const GET_EMPTY_TILES_ONLY = 2;
export const GET_ALL_TILES = 3;
export const HIGH_QUALITY = 4;

// export const get_level_tiles = (width_px, scope, flag = GET_ALL_TILES) => {
//    const quality_factor = flag === HIGH_QUALITY ? 3.5 : 2.5;
//    const ideal_level = get_ideal_level(width_px, scope, quality_factor);
//    const cache_key = `level_${ideal_level}`
//    if (flag === GET_COMPLETED_TILES_ONLY) {
//       return LEVEL_SCOPES[ideal_level].cells;
//    }
//    if (flag === GET_EMPTY_TILES_ONLY) {
//       return LEVEL_SCOPES[ideal_level].empties;
//    }
//    if (!cached_level_tiles[cache_key]) {
//       cached_level_tiles[cache_key] = LEVEL_SCOPES[ideal_level].cells.concat(LEVEL_SCOPES[ideal_level].empties);
//    }
//    return cached_level_tiles[cache_key];
// }

export const get_empties = (level) => {
   return LEVEL_SCOPES[level].empties;
}

// export const get_level_cells = (level) => {
//    return LEVEL_SCOPES[level].cells;
// }

export const get_level_scope = (level) => {
   return LEVEL_SCOPES[level].scope;
}

// export const get_tile = (level, code) => {
//    const list_of_one = LEVEL_SCOPES[level].cells.filter(tile => tile.code === code);
//    return list_of_one.length ? list_of_one[0] : null;
// }

// export const get_region_tiles = (level, focal_point, scope, aspect_ratio = 1.0) => {
//    const scope_by_two = scope / 2;
//    const viewport = {
//       left: focal_point.x - scope_by_two,
//       top: focal_point.y + scope_by_two * aspect_ratio,
//       right: focal_point.x + scope_by_two,
//       bottom: focal_point.y - scope_by_two * aspect_ratio,
//    }
//    return LEVEL_SCOPES[level].cells.filter(cell => {
//       if (cell.bounds.right < viewport.left) {
//          return false;
//       }
//       if (cell.bounds.left > viewport.right) {
//          return false;
//       }
//       if (cell.bounds.top < viewport.bottom) {
//          return false;
//       }
//       if (cell.bounds.bottom > viewport.top) {
//          return false;
//       }
//       return true;
//    })
// }

const URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";

const COMPLETED_TILES_URL = `${URL_BASE}/directory/complete.csv`;
const POTENTIALS_TILES_URL = `${URL_BASE}/directory/new.csv`;
const READY_TILES_URL = `${URL_BASE}/directory/ready.csv`;
const INDEXED_TILES_URL = `${URL_BASE}/directory/indexed.csv`;
const ERROR_TILES_URL = `${URL_BASE}/directory/error.csv`;

const BIN_COUNTS_URL = `${URL_BASE}/directory/bin_counts.json`;

export class FractoData extends Component {

   static completed_tiles_loaded = false;
   static potentials_tiles_loaded = false;
   static ready_tiles_loaded = false;
   static indexed_tiles_loaded = false;
   static error_tiles_loaded = false;

   static loading_completed_tiles = false;
   static loading_potentials_tiles = false;
   static loading_ready_tiles = false;
   static loading_indexed_tiles = false;
   static loading_error_tiles = false;

   static fetch_bin_async = (url, verb, cb) => {
      console.log(`fetching ${verb} tiles`)
      fetch(url)
         .then(response => response.text())
         .then(csv => {
            const lines = csv.split("\n");
            console.log(`${verb} tiles loaded`, lines.length)
            for (let line_index = 1; line_index < lines.length; line_index++) {
               const values = lines[line_index].split(',');
               const short_code = String(values[0]);
               const level = short_code.length;
               LEVEL_SCOPES[level][verb][short_code] = {
                  left: parseFloat(values[1]),
                  top: parseFloat(values[2]),
                  right: parseFloat(values[3]),
                  bottom: parseFloat(values[4]),
               }
            }
            console.log(`${verb} tiles parsed`)
            cb(true);
         })
   }

   static load_completed_async = (cb) => {
      if (FractoData.completed_tiles_loaded) {
         cb(true);
         return;
      }
      if (FractoData.loading_completed_tiles) {
         cb(false);
         return;
      }
      FractoData.loading_completed_tiles = true;
      FractoData.fetch_bin_async(COMPLETED_TILES_URL, "completed", result => {
         FractoData.completed_tiles_loaded = true;
         FractoData.loading_completed_tiles = false;
         cb(result);
      })
   }

   static load_potentials_async = (cb) => {
      if (FractoData.potentials_tiles_loaded) {
         cb(true);
         return;
      }
      if (FractoData.loading_potentials_tiles) {
         cb(false);
         return;
      }
      FractoData.loading_potentials_tiles = true;
      FractoData.fetch_bin_async(POTENTIALS_TILES_URL, "potentials", result => {
         FractoData.potentials_tiles_loaded = true;
         FractoData.loading_potentials_tiles = false;
         cb(result);
      })
   }

   static load_ready_async = (cb) => {
      if (FractoData.ready_tiles_loaded) {
         cb(true);
         return;
      }
      if (FractoData.loading_ready_tiles) {
         cb(false);
         return;
      }
      FractoData.loading_ready_tiles = true;
      FractoData.fetch_bin_async(READY_TILES_URL, "ready", result => {
         FractoData.ready_tiles_loaded = true;
         FractoData.loading_ready_tiles = false;
         cb(result);
      })
   }

   static load_indexed_async = (cb) => {
      if (FractoData.indexed_tiles_loaded) {
         cb(true);
         return;
      }
      if (FractoData.loading_indexed_tiles) {
         cb(false);
         return;
      }
      FractoData.loading_indexed_tiles = true;
      FractoData.fetch_bin_async(INDEXED_TILES_URL, "indexed", result => {
         FractoData.indexed_tiles_loaded = true;
         FractoData.loading_indexed_tiles = false;
         cb(result);
      })
   }

   static load_error_async = (cb) => {
      if (FractoData.error_tiles_loaded) {
         cb(true);
         return;
      }
      if (FractoData.loading_error_tiles) {
         cb(false);
         return;
      }
      FractoData.loading_error_tiles = true;
      FractoData.fetch_bin_async(ERROR_TILES_URL, "error", result => {
         FractoData.error_tiles_loaded = true;
         FractoData.loading_error_tiles = false;
         cb(result);
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

   static all_tiles_cache = {}

   static tiles_in_scope = (level, focal_point, scope, aspect_ratio = 1.0) => {
      const width_by_two = scope / 2;
      const height_by_two = width_by_two * aspect_ratio;
      const viewport = {
         left: focal_point.x - width_by_two,
         top: focal_point.y + height_by_two,
         right: focal_point.x + width_by_two,
         bottom: focal_point.y - height_by_two,
      }
      const cache_key = `all_tiles_level_${level}`
      if (!FractoData.all_tiles_cache[cache_key]) {
         const completed_tiles = LEVEL_SCOPES[level]["completed"];
         const indexed_tiles = LEVEL_SCOPES[level]["indexed"];
         const ready_tiles = LEVEL_SCOPES[level]["ready"];
         FractoData.all_tiles_cache[cache_key] = Object.assign({}, completed_tiles, indexed_tiles, ready_tiles)
      }
      const all_tiles = FractoData.all_tiles_cache[cache_key];
      const level_keys = Object.keys(all_tiles)
      const filtered_keys = level_keys.filter(key => {
         const bounds = all_tiles[key];
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
            bounds: all_tiles[key]
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
         console.log(`building cache for ${verb} tiles on level ${level}`)
         const level_keys = Object.keys(LEVEL_SCOPES[level][verb]);
         const processed_tiles = level_keys.map(key => {
            return {
               short_code: key,
               bounds: LEVEL_SCOPES[level][verb][key]
            }
         })
         FractoData.tiles_cache[cache_key] = processed_tiles;
      }
      return FractoData.tiles_cache[cache_key]
   }

   static get_completed_tiles = (level) => {
      if (!FractoData.completed_tiles_loaded) {
         return [];
      }
      return FractoData.get_cached_tiles(level, "completed");
   }

   static get_potential_tiles = (level) => {
      if (!FractoData.potentials_tiles_loaded) {
         return [];
      }
      return FractoData.get_cached_tiles(level, "potentials")
   }

   static get_ready_tiles = (level) => {
      if (!FractoData.ready_tiles_loaded) {
         return [];
      }
      return FractoData.get_cached_tiles(level, "ready");
   }

   static get_indexed_tiles = (level) => {
      if (!FractoData.indexed_tiles_loaded) {
         return [];
      }
      return FractoData.get_cached_tiles(level, "indexed");
   }

   static get_error_tiles = (level) => {
      if (!FractoData.error_tiles_loaded) {
         return [];
      }
      return FractoData.get_cached_tiles(level, "error");
   }

}

export default FractoData;
