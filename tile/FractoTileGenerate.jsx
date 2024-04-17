import StoreS3 from "common/system/StoreS3";
import FractoUtil from "../FractoUtil";
import FractoCalc from "../data/FractoCalc";
import FractoFastCalc from "../data/FractoFastCalc";
import FractoMruCache from "../data/FractoMruCache";

export class FractoTileGenerate {

   static calculate_tile = (tile, tile_points, cb) => {
      console.log("calculate_tile", tile)
      const increment = (tile.bounds.right - tile.bounds.left) / 256.0;
      const start = performance.now()
      let ran_slow_calc = 0
      let ran_fast_calc = 0
      let replaced_points = 0
      for (let img_x = 0; img_x < 256; img_x++) {
         const x = tile.bounds.left + img_x * increment;
         const x_naught = img_x % 2 === 0
         let recent_iteration = 1000
         for (let img_y = 0; img_y < 256; img_y++) {
            const y_naught = img_y % 2 === 0
            if (x_naught && y_naught) {
               continue;
            }
            const y = tile.bounds.top - img_y * increment;
            const point_in_main_cardioid = FractoFastCalc.point_in_main_cardioid(x, y)
            if (point_in_main_cardioid || tile.inland_tile) {
               const values = FractoCalc.calc(x, y)
               tile_points[img_x][img_y] = [values.pattern, values.iteration];
               ran_slow_calc++
            } else {
               const values = FractoFastCalc.calc(x, y)
               let iteration = values.iteration
               if (values.pattern > 0) {
                  const closest_x_naught = x_naught ? img_x : img_x - 1
                  const closest_y_naught = y_naught ? img_y : img_y - 1
                  const naught_point = tile_points[closest_x_naught][closest_y_naught]
                  iteration = values.pattern === 0 ? values.iteration : naught_point[1]
               }
               tile_points[img_x][img_y] = [values.pattern, iteration];
               ran_fast_calc++
            }
         }
      }
      const end = performance.now()
      console.log(`generated ${tile.short_code} in ${end - start}ms, slow=${ran_slow_calc}, fast=${ran_fast_calc}, replaced=${replaced_points}`)

      const index_url = `tiles/256/indexed/${tile.short_code}.json`;
      StoreS3.put_file_async(index_url, JSON.stringify(tile_points), "fracto", result => {
         console.log("StoreS3.put_file_async", index_url, result);
         FractoUtil.tile_to_bin(tile.short_code, "ready", "complete", result => {
            console.log("ToolUtils.tile_to_bin", tile.short_code, result);
         })
         FractoUtil.tile_to_bin(tile.short_code, "inland", "complete", result => {
            console.log("ToolUtils.tile_to_bin", tile.short_code, result);
         })
      })

      cb("generated tile")
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

   static prepare_tile = () => {
      return new Array(256).fill(0).map(() => new Array(256).fill([0, 0]));
   }

}

export default FractoTileGenerate;
