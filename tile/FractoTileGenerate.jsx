import StoreS3 from "common/system/StoreS3";
import FractoUtil from "../FractoUtil";
import FractoFastCalc from "../data/FractoFastCalc";
import FractoMruCache from "../data/FractoMruCache";

export class FractoTileGenerate {

   static calculate_tile = (tile, tile_points, cb) => {
      console.log("calculate_tile", tile)
      const level = tile.short_code.length
      const increment = (tile.bounds.right - tile.bounds.left) / 256.0;
      for (let img_x = 0; img_x < 256; img_x++) {
         const x = tile.bounds.left + img_x * increment;
         const x_naught = img_x % 2 === 0
         for (let img_y = 0; img_y < 256; img_y++) {
            const y_naught = img_y % 2 === 0
            if (x_naught && y_naught) {
               const [pattern, iteration] = tile_points[img_x][img_y]
               if (pattern === 0) {
                  continue;
               }
               if (iteration > 50000 && pattern > 0) {
                  continue;
               }
            }
            const y = tile.bounds.top - img_y * increment;
            const values = FractoFastCalc.calc(x, y, level)
            tile_points[img_x][img_y] = [values.pattern, values.iteration];
         }
      }

      const index_url = `tiles/256/indexed/${tile.short_code}.json`;
      StoreS3.put_file_async(index_url, JSON.stringify(tile_points), "fracto", result => {
         console.log("StoreS3.put_file_async", index_url, result);
         cb(`stored tile`)
      })
   }

   static prepare_generator = (tile_points, parent_tile_data, quad_code) => {
      // console.log("prepare_generator", parent_tile_data.length, quad_code)
      let col_start, col_end, row_start, row_end;
      switch (quad_code) {
         case '0':
            col_start = 0;
            col_end = 128;
            row_start = 0;
            row_end = 128;
            break;
         case '1':
            col_start = 128;
            col_end = 256;
            row_start = 0;
            row_end = 128;
            break;
         case '2':
            col_start = 0;
            col_end = 128;
            row_start = 128;
            row_end = 256;
            break;
         case '3':
            col_start = 128;
            col_end = 256;
            row_start = 128;
            row_end = 256;
            break;
         default:
            console.log('bad quad_code');
            return null;
      }
      for (let img_x = col_start, result_col = 0; img_x < col_end; img_x++, result_col += 2) {
         for (let img_y = row_start, result_row = 0; img_y < row_end; img_y++, result_row += 2) {
            tile_points[result_col][result_row] = parent_tile_data[img_x][img_y]
         }
      }
   }

   static generate_tile = (tile, tile_points, cb) => {
      const parent_short_code = tile.short_code.substr(0, tile.short_code.length - 1)
      const quad_code = tile.short_code[tile.short_code.length - 1];
      FractoMruCache.get_tile_data(parent_short_code, parent_tile_data => {
         FractoTileGenerate.prepare_generator(tile_points, parent_tile_data, quad_code)
         FractoTileGenerate.calculate_tile(tile, tile_points, result => {
            cb(result)
         })
      })
   }

   static base_tile = null

   static prepare_tile = () => {
      if (!FractoTileGenerate.base_tile) {
         FractoTileGenerate.base_tile = new Array(256)
            .fill(0)
            .map(() => new Array(256)
               .fill([0, 0]));
      }
      for (let img_x = 0; img_x < 256; img_x++) {
         for (let img_y = 0; img_y < 256; img_y++) {
            FractoTileGenerate.base_tile[img_x][img_y] = [0, 0]
         }
      }
      return FractoTileGenerate.base_tile
   }

   static test_edge_case = (tile, tile_data) => {
      if (tile.bounds.bottom === 0) {
         // console.log("will not edge bottom tile");
         return false
      }
      const [pattern0, iterations0] = tile_data[0][0];
      for (let img_x = 0; img_x < 256; img_x++) {
         for (let img_y = 0; img_y < 256; img_y++) {
            const [pattern, iterations] = tile_data[img_x][img_y];
            if (iterations !== iterations0 || pattern !== pattern0) {
               // console.log("not on edge");
               return false;
            }
         }
      }
      console.log("all points are", iterations0);
      return true
   }

   static compare_tile_data = (points_1, points_2) => {
      if (!points_1) {
         debugger;
         return false
      }
      if (!points_2) {
         debugger;
         return false
      }
      if (points_1.length !== 256) {
         debugger;
         return false
      }
      if (points_2.length !== 256) {
         debugger;
         return false
      }
      for (let img_x = 0; img_x < 256; img_x++) {
         if (points_1[img_x].length !== 256) {
            debugger;
            return false
         }
         if (points_2[img_x].length !== 256) {
            debugger;
            return false
         }
         for (let img_y = 0; img_y < 256; img_y++) {
            if (points_1[img_x][img_y].length !== 2) {
               debugger;
               return false;
            }
            if (points_2[img_x][img_y].length !== 2) {
               debugger;
               return false;
            }
            if (points_1[img_x][img_y][0] !== points_2[img_x][img_y][0]) {
               debugger;
               return false
            }
            if (points_1[img_x][img_y][1] !== points_2[img_x][img_y][1]) {
               debugger;
               return false
            }
         }
      }
      return true;
   }

   static begin = (tile, cb) => {
      console.log('begin generate tile', tile)
      const start = performance.now()
      const tile_points = FractoTileGenerate.prepare_tile()
      let tile_copy = JSON.parse(JSON.stringify(tile))
      FractoTileGenerate.generate_tile(tile_copy, tile_points, response => {
         const is_edge_tile = FractoTileGenerate.test_edge_case(tile, tile_points);
         if (is_edge_tile) {
            FractoUtil.empty_tile(tile.short_code, result => {
               console.log("FractoUtil.empty_tile", tile.short_code, result);
               const full_history = [
                  response,
                  `${result.all_descendants.length} ${result.result}`
               ].join(', ')
               cb(full_history)
            })
         } else {
            FractoUtil.tile_to_bin(tile.short_code, "complete", "indexed", result => {
               console.log("FractoUtil.tile_to_bin", tile.short_code, "complete", "indexed", result);
               FractoMruCache.get_tile_data_raw(tile.short_code, data => {
                  // console.log(`get_tile_data_raw ${tile.short_code}`, data ? data.length : 0)
                  // const success = FractoTileGenerate.compare_tile_data(tile_points, data)
                  const end = performance.now()
                  const seconds = Math.round((end - start)) / 1000
                  const full_history = `${response}, ${result.result} in ${seconds}s`
                  setTimeout(() => {
                     cb(full_history, tile_points)
                  }, 250)
               })
            })
         }
      })
   }
}

export default FractoTileGenerate;
