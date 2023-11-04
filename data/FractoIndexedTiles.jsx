import {Component} from 'react';

import network from "common/config/network.json"
import FractoUtil from "../FractoUtil"

const LEVEL_TILES_URL_BASE = `${network.dev_server_url}/directory/levels`;

var LEVELS_CACHE = {}

export class FractoIndexedTiles extends Component {

   static get_level_tiles = (level, cb) => {
      console.log(`loading tiles for level ${level}`)
      const cache_key = `LEVEL_${level}_tiles`
      if (LEVELS_CACHE[cache_key]) {
         cb(LEVELS_CACHE[cache_key])
         return;
      }
      const prefix = level < 10 ? '0' : ''
      const url = `${LEVEL_TILES_URL_BASE}/indexed_L${prefix}${level}.json`
      fetch(url)
         .then(response => response.json())
         .then(json => {
            const with_bounds = json.map(short_code => {
               return {
                  short_code: short_code,
                  bounds: FractoUtil.bounds_from_short_code(short_code)
               }
            })
            console.log(`indexed tiles loaded for level ${level}`, with_bounds.length)
            LEVELS_CACHE[cache_key] = with_bounds
            cb(with_bounds);
         })
   }

   static tiles_in_scope = (level, focal_point, scope, aspect_ratio = 1.0) => {
      const cache_key = `LEVEL_${level}_tiles`
      if (!LEVELS_CACHE[cache_key]) {
         console.log('tiles not cached for level', level)
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
      }).sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? 1 : -1) :
            (a.bounds.left > b.bounds.left ? -1 : 1)
      })
   }

}

export default FractoIndexedTiles;
