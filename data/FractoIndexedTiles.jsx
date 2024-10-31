import {Component} from 'react';

import network from "common/config/network.json";

const URL_BASE = network.dev_server_url;
const SERVER_BASE = network.fracto_server_url;

export const TILE_SET_INDEXED = 'indexed'
export const TILE_SET_READY = 'ready'
export const TILE_SET_INLAND = 'inland'
export const TILE_SET_NEW = 'new'
export const TILE_SET_EMPTY = 'empty'
export const TILE_SET_UPDATED = 'updated'
const ALL_TILE_SETS = [
   TILE_SET_INDEXED,
   TILE_SET_READY,
   TILE_SET_INLAND,
   TILE_SET_NEW,
   TILE_SET_EMPTY,
   TILE_SET_UPDATED,
]

export class FractoIndexedTiles extends Component {

   static tile_set = null;
   static tile_sets_loaded = [];
   static init_tile_sets = () => {
      if (FractoIndexedTiles.tile_set !== null) {
         return;
      }
      FractoIndexedTiles.tile_set = {}
      ALL_TILE_SETS.forEach(set_name => {
         FractoIndexedTiles.tile_set[set_name] = []
         for (let level = 2; level < 40; level++) {
            FractoIndexedTiles.tile_set[set_name].push({
               level: level,
               tile_size: Math.pow(2, 2 - level),
               columns: []
            })
         }
      })
      // console.log('FractoIndexedTiles.tile_set', FractoIndexedTiles.tile_set)
   }

   static tile_set_is_loaded = (set_name) => {
      console.log("FractoIndexedTiles.tile_sets_loaded", FractoIndexedTiles.tile_sets_loaded)
      return FractoIndexedTiles.tile_sets_loaded.includes(set_name);
   }

   static get_set_level = (set_name, level) => {
      if (FractoIndexedTiles.tile_set === null) {
         FractoIndexedTiles.init_tile_sets();
      }
      // console.log(`set_name: ${set_name}, level: ${level}`)
      return FractoIndexedTiles.tile_set[set_name]
         .find(bin => bin.level === level)
   }

   static integrate_tile_packet = (set_name, packet_data) => {
      const level = packet_data.level
      if (!FractoIndexedTiles.tile_sets_loaded.includes(set_name)) {
         FractoIndexedTiles.tile_sets_loaded.push(set_name)
      }
      let set_level = FractoIndexedTiles.get_set_level(set_name, level)
      // console.log('integrate_tile_packet', level, set_name, packet_data.columns, set_level.columns)
      if (!set_level) {
         console.log(`problem with ${set_name}:${level}`)
         return;
      }
      set_level.columns = set_level.columns.concat(packet_data.columns)
   }

   static load_short_codes = (tile_set_name, cb) => {
      const directory_url = `${URL_BASE}/directory/${tile_set_name}.csv`;
      fetch(directory_url)
         .then(response => response.text())
         .then(csv => {
            const lines = csv.split("\n");
            console.log(`fetch_bin_async ${lines.length}`)
            cb(lines.slice(1))
         })
   }

   static load_no_cache = (cb) => {
      const no_cache_url = `${SERVER_BASE}/package/no_cache.csv`;
      fetch(no_cache_url)
         .then(response => response.text())
         .then(csv => {
            const lines = csv.split("\n");
            console.log(`fetch_bin_async ${lines.length}`)
            cb(lines.slice(1))
         })
   }

   static tiles_in_level = (level, set_name = TILE_SET_INDEXED) => {
      const set_level = FractoIndexedTiles.get_set_level(set_name, level)
      if (!set_level) {
         // console.log(`no bin for level ${level}`)
         return []
      }
      const columns = set_level.columns
      let short_codes = []
      for (let column_index = 0; column_index < columns.length; column_index++) {
         const tiles_in_column = columns[column_index].tiles
         const column_left = columns[column_index].left
         const column_tiles = tiles_in_column
            .map(tile => {
               return {
                  bounds: {
                     left: column_left,
                     right: column_left + set_level.tile_size,
                     bottom: tile.bottom,
                     top: tile.bottom + set_level.tile_size
                  },
                  short_code: tile.short_code
               }
            })
         short_codes = short_codes.concat(column_tiles)
      }
      return short_codes.sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
   }

   static tiles_in_scope = (level, focal_point, scope, aspect_ratio = 1.0, set_name = TILE_SET_INDEXED) => {
      const width_by_two = scope / 2;
      const height_by_two = width_by_two * aspect_ratio;
      const viewport = {
         left: focal_point.x - width_by_two,
         top: focal_point.y + height_by_two,
         right: focal_point.x + width_by_two,
         bottom: focal_point.y - height_by_two,
      }
      const set_level = FractoIndexedTiles.get_set_level(set_name, level)
      if (!set_level) {
         console.log(`no bin for level ${level} of set_name ${set_name}`)
         return []
      }
      if (!set_level.columns.length) {
         console.log(`no columns for level ${level} of set_name ${set_name}`)
         return []
      }
      const columns = set_level.columns
         .filter(column => {
            if (column.left > viewport.right) {
               return false
            }
            if (column.left + set_level.tile_size < viewport.left) {
               return false
            }
            return true;
         })
      let short_codes = []
      for (let column_index = 0; column_index < columns.length; column_index++) {
         const tiles_in_column = columns[column_index].tiles
         const column_left = columns[column_index].left
         const column_tiles = tiles_in_column
            .filter(tile => {
                  if (tile.bottom > viewport.top) {
                     return false
                  }
                  if (tile.bottom + set_level.tile_size < viewport.bottom) {
                     return false
                  }
                  return true
               })
            .map(tile => {
               return {
                  bounds: {
                     left: column_left,
                     right: column_left + set_level.tile_size,
                     bottom: tile.bottom,
                     top: tile.bottom + set_level.tile_size
                  },
                  short_code: tile.short_code
               }
            })
         short_codes = short_codes.concat(column_tiles)
      }
      return short_codes
   }

   static get_tile_scopes = (set_name, focal_point, scope) => {
      // console.log('get_tile_scopes = (set_name, focal_point, scope)', set_name, focal_point, scope)
      const level_tiles_in_scope = []
      // console.log('FractoIndexedTiles.tile_set[set_name]', set_name, FractoIndexedTiles.tile_set[set_name])
      for (let level = 2; level < 35; level++) {
         const tiles_in_level = FractoIndexedTiles
            .tiles_in_scope(level, focal_point, scope, 1.0, set_name);
         if (!tiles_in_level.length) {
            continue;
         }
         // console.log('tiles_in_level', level, tiles_in_level)
         if (tiles_in_level.length > 350) {
            continue;
         }
         level_tiles_in_scope.push({
            level: level,
            tiles: tiles_in_level
         })
      }
      return level_tiles_in_scope
   }

}

export default FractoIndexedTiles;
