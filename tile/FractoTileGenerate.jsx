import FractoFastCalc from "../data/FractoFastCalc";
import FractoTileCache from "../data/FractoTileCache";

export class FractoTileGenerate {

   static calculate_tile = (tile, tile_points, is_updated, cb) => {
      console.log("calculate_tile", tile)
      const level = tile.short_code.length
      const increment = (tile.bounds.right - tile.bounds.left) / 256.0;
      for (let img_x = 0; img_x < 256; img_x++) {
         const x = tile.bounds.left + img_x * increment;
         const x_naught = img_x % 2 === 0
         for (let img_y = 0; img_y < 256; img_y++) {
            const y_naught = img_y % 2 === 0
            if (x_naught && y_naught && !is_updated) {
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
      cb('calculated tile')
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

   static generate_tile = async (tile, tile_points, is_updated, cb) => {
      if (!is_updated) {
         const parent_short_code = tile.short_code.substr(0, tile.short_code.length - 1)
         const quad_code = tile.short_code[tile.short_code.length - 1];
         const parent_tile_data = await FractoTileCache.get_tile(parent_short_code);
         if (!parent_tile_data) {
            cb(false)
         }
         FractoTileGenerate.prepare_generator(tile_points, parent_tile_data, quad_code)
      } else {
         FractoTileGenerate.calculate_tile(tile, tile_points, is_updated, result => {
            cb(result)
         })
      }
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
      // console.log("all points are", iterations0);
      return true
   }

   static begin = (tile, is_updated, cb) => {
      // console.log('begin generate tile', tile)
      const start = performance.now()
      const tile_points = FractoTileGenerate.prepare_tile()
      let tile_copy = JSON.parse(JSON.stringify(tile))
      FractoTileGenerate.generate_tile(tile_copy, tile_points, is_updated, response => {
         const is_edge_tile = FractoTileGenerate.test_edge_case(tile_copy, tile_points);
         if (is_edge_tile) {
            cb('tile is blank', tile_copy, tile_points)
         } else {
            const end = performance.now()
            const seconds = Math.round((end - start)) / 1000
            const full_history = `${response}, in ${seconds}s`
            setTimeout(() => {
               cb(full_history, tile_points)
            }, 150)
         }
      })
   }
}

export default FractoTileGenerate;
