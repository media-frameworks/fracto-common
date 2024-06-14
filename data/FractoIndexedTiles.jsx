import {Component} from 'react';

import {
   get_indexed_bounds,
   get_indexed_short_codes
} from "./FractoData"

var LEVELS_CACHE = {}

export class FractoIndexedTiles extends Component {

   static get_level_tiles = (level, cb) => {
      const cache_key = `LEVEL_${level}_tiles`
      if (LEVELS_CACHE[cache_key]) {
         cb(LEVELS_CACHE[cache_key])
         return;
      }
      const short_codes = get_indexed_short_codes(level)
      console.log(`${short_codes.length} tiles for level ${level}`)
      const with_bounds = short_codes.map(short_code => {
         return {
            short_code: short_code,
            bounds: get_indexed_bounds(level, short_code)
         }
      })
      LEVELS_CACHE[cache_key] = with_bounds
      cb(with_bounds);
   }

   static tiles_in_scope = (level, focal_point, scope, aspect_ratio = 1.0) => {
      const cache_key = `LEVEL_${level}_tiles`
      if (!LEVELS_CACHE[cache_key]) {
         // console.log('tiles not cached for level', level)
         return [];
      }
      const width_by_two = scope / 2;
      const height_by_two = width_by_two * aspect_ratio;
      const viewport = {
         left: focal_point.x - width_by_two,
         top: focal_point.y + height_by_two,
         right: focal_point.x + width_by_two,
         bottom: focal_point.y - height_by_two,
      }
      return LEVELS_CACHE[cache_key].filter(tile => {
         if (tile.bounds.right < viewport.left) {
            return false;
         }
         if (tile.bounds.left > viewport.right) {
            return false;
         }
         if (tile.bounds.top < viewport.bottom) {
            return false;
         }
         if (tile.bounds.bottom > viewport.top) {
            return false;
         }
         return true;
      }).map(tile => {
         let new_tile = JSON.parse(JSON.stringify(tile))
         const center_x = (new_tile.bounds.left + new_tile.bounds.right) / 2
         const center_y = (new_tile.bounds.top + new_tile.bounds.bottom) / 2
         const diff_x = center_x - focal_point.x
         const diff_y = center_y - focal_point.y
         new_tile.distance = Math.sqrt(diff_x * diff_x + diff_y * diff_y)
         return new_tile
      }).sort((a, b) => b.distance - a.distance)
   }

}

export default FractoIndexedTiles;
