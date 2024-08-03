import {Component} from 'react';

import network from "common/config/network.json";

const URL_BASE = network.dev_server_url;

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
      const set_level = FractoIndexedTiles.get_set_level(set_name, level)
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
         // console.log(`no bin for level ${level}`)
         return []
      }
      const columns = set_level.columns
         .filter(column =>
            column.left + set_level.tile_size > viewport.left
            && column.left < viewport.right)
      let short_codes = []
      for (let column_index = 0; column_index < columns.length; column_index++) {
         const tiles_in_column = columns[column_index].tiles
         const column_left = columns[column_index].left
         const column_tiles = tiles_in_column
            .filter(tile =>
               tile.bottom + set_level.tile_size > viewport.bottom
               && tile.bottom < viewport.top
            )
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
         .map(tile => {
            let new_tile = JSON.parse(JSON.stringify(tile))
            const center_x = (new_tile.bounds.left + new_tile.bounds.right) / 2
            const center_y = (new_tile.bounds.top + new_tile.bounds.bottom) / 2
            const diff_x = center_x - focal_point.x
            const diff_y = center_y - focal_point.y
            new_tile.distance = Math.sqrt(diff_x * diff_x + diff_y * diff_y)
            return new_tile
         })
         .sort((a, b) => b.distance - a.distance)
   }

}

export default FractoIndexedTiles;
