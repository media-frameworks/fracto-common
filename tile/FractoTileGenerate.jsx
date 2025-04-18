import FractoFastCalc from "../data/FractoFastCalc";

export class FractoTileGenerate {

   static calculate_tile = (tile, tile_points, is_updated, cb) => {
      console.log("calculate_tile", tile)
      const level = tile.short_code.length
      const increment = (tile.bounds.right - tile.bounds.left) / 256.0;
      for (let img_x = 0; img_x < 256; img_x++) {
         const x = tile.bounds.left + img_x * increment;
         for (let img_y = 0; img_y < 256; img_y++) {
            const y = tile.bounds.top - img_y * increment;
            const values = FractoFastCalc.calc(x, y, level)
            tile_points[img_x][img_y] = [values.pattern, values.iteration];
         }
      }
      cb('calculated tile')
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
      FractoTileGenerate.calculate_tile(tile_copy, tile_points, is_updated, response => {
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
