import {Component} from 'react';

import FractoUtil from "../FractoUtil";
import network from "common/config/network.json";

const URL_BASE = network.dev_server_url;

const TILE_SET_INDEXED = 'tile_set_indexed'
const TILE_SET_READY = 'tile_set_ready'
const TILE_SET_INLAND = 'tile_set_inland'
const TILE_SET_NEW = 'tile_set_new'
const TILE_SET_EMPTY = 'tile_set_empty'
const TILE_SET_UPDATED = 'tile_set_updated'
const ALL_TILE_SETS = [
   TILE_SET_INDEXED,
   TILE_SET_READY,
   TILE_SET_INLAND,
   TILE_SET_NEW,
   TILE_SET_EMPTY,
   TILE_SET_UPDATED,
]

export class FractoIndexedTiles extends Component {

   static tile_index = []
   static tile_set = null;
   static init_tile_sets = () => {
      if (FractoIndexedTiles.tile_set !== null) {
         return;
      }
      FractoIndexedTiles.tile_set = {}
      ALL_TILE_SETS.forEach(set_name => {
         FractoIndexedTiles.tile_set[set_name] = []
         for (let level = 2; level < 35; level++) {
            FractoIndexedTiles.tile_set[set_name].push({
               level: level,
               tile_size: Math.pow(2, 2 - level),
               columns: []
            })
         }
      })
      console.log('FractoIndexedTiles.tile_set', FractoIndexedTiles.tile_set)
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

   static tiles_in_level = (level) => {
      const level_bin = FractoIndexedTiles.tile_index
         .find(bin => bin.level === level)
      if (!level_bin) {
         // console.log(`no bin for level ${level}`)
         return []
      }
      const columns = level_bin.columns
      let short_codes = []
      for (let column_index = 0; column_index < columns.length; column_index++) {
         const tiles_in_column = columns[column_index].tiles
         const column_left = columns[column_index].left
         const column_tiles = tiles_in_column
            .map(tile => {
               return {
                  bounds: {
                     left: column_left,
                     right: column_left + level_bin.tile_size,
                     bottom: tile.bottom,
                     top: tile.bottom + level_bin.tile_size
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

   static tiles_in_scope = (level, focal_point, scope, aspect_ratio = 1.0) => {
      const width_by_two = scope / 2;
      const height_by_two = width_by_two * aspect_ratio;
      const viewport = {
         left: focal_point.x - width_by_two,
         top: focal_point.y + height_by_two,
         right: focal_point.x + width_by_two,
         bottom: focal_point.y - height_by_two,
      }
      const level_bin = FractoIndexedTiles.tile_index
         .find(bin => bin.level === level)
      if (!level_bin) {
         // console.log(`no bin for level ${level}`)
         return []
      }
      const columns = level_bin.columns
         .filter(column =>
            column.left + level_bin.tile_size > viewport.left
            && column.left < viewport.right)
      let short_codes = []
      for (let column_index = 0; column_index < columns.length; column_index++) {
         const tiles_in_column = columns[column_index].tiles
         const column_left = columns[column_index].left
         const column_tiles = tiles_in_column
            .filter(tile =>
               tile.bottom + level_bin.tile_size > viewport.bottom
               && tile.bottom < viewport.top
            )
            .map(tile => {
               return {
                  bounds: {
                     left: column_left,
                     right: column_left + level_bin.tile_size,
                     bottom: tile.bottom,
                     top: tile.bottom + level_bin.tile_size
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

FractoIndexedTiles.init_tile_sets()

export default FractoIndexedTiles;
