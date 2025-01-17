import FractoIndexedTiles from "../data/FractoIndexedTiles";
import FractoMruCache, {TILE_CACHE} from "../data/FractoMruCache";
import FractoUtil from "../FractoUtil";
import FractoFastCalc from "../data/FractoFastCalc";

const MAX_LEVEL = 35;

const get_tiles = (width_px, focal_point, scope, aspect_ratio, quality = 1) => {
   const all_tiles = []
   const height_px = width_px * aspect_ratio
   const tiles_on_edge_x = Math.ceil(width_px / 256) + 0.5;
   const tiles_on_edge_y = Math.ceil(height_px / 256) + 0.5;
   const max_tiles = Math.ceil(tiles_on_edge_x * tiles_on_edge_y + 0.5)
   for (let level = 2; level < MAX_LEVEL; level++) {
      const level_tiles = FractoIndexedTiles.tiles_in_scope(
         level, focal_point, scope, aspect_ratio);
      all_tiles.push({
         level: level,
         level_tiles: level_tiles
      })
      if (level_tiles.length > max_tiles) {
         break;
      }
   }
   return all_tiles.filter(tiles => tiles.level_tiles.length)
      .sort((a, b) => a.level > b.level ? 1 : -1)
}

export const create_canvas_buffer = (width_px, height_px) => {
   return new Array(width_px).fill(0).map(() => new Array(height_px).fill([0, 4]));
}

const raster_fill = (
   canvas_buffer, level_data_sets, ctx,
   width_px, focal_point, scope, aspect_ratio) => {

   const canvas_increment = scope / width_px
   const horz_scale = []
   const leftmost = focal_point.x - scope / 2
   for (let horz_x = 0; horz_x < width_px; horz_x++) {
      horz_scale[horz_x] = leftmost + horz_x * canvas_increment
   }
   const vert_scale = []
   const topmost = focal_point.y + scope * aspect_ratio / 2
   const height_px = width_px * aspect_ratio
   for (let vert_y = 0; vert_y < height_px; vert_y++) {
      vert_scale[vert_y] = Math.abs(topmost - vert_y * canvas_increment)
   }
   for (let canvas_x = 0; canvas_x < width_px; canvas_x++) {
      const x = horz_scale[canvas_x]
      for (let canvas_y = 0; canvas_y < height_px; canvas_y++) {
         const y = vert_scale[canvas_y]
         let found_point = false
         for (let index = 0; index < level_data_sets.length; index++) {
            const level_data_set = level_data_sets[index]
            const tile = level_data_set.level_tiles
               .find(tile => tile.bounds.left < x
                  && tile.bounds.right > x
                  && tile.bounds.top > y
                  && tile.bounds.bottom < y)
            if (tile) {
               const tile_data = TILE_CACHE[tile.short_code]
               if (!tile_data) {
                  continue;
               }
               const tile_x = Math.floor(
                  (x - tile.bounds.left) / level_data_set.tile_increment)
               if (!tile_data[tile_x]) {
                  continue
               }
               const tile_y = Math.floor(
                  (tile.bounds.top - y) / level_data_set.tile_increment)
               if (!tile_data[tile_x][tile_y]) {
                  continue
               }
               const pattern = tile_data[tile_x][tile_y][0]
               const iteration = tile_data[tile_x][tile_y][1]
               if (canvas_buffer && canvas_buffer[canvas_x] && canvas_buffer[canvas_x][canvas_y]) {
                  canvas_buffer[canvas_x][canvas_y] = [pattern, iteration]
               }
               const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(pattern, iteration)
               ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
               ctx.fillRect(canvas_x, canvas_y, 2, 2);
               found_point = true
               break;
            }
         }
         if (!found_point) {
            const {pattern, iteration} = FractoFastCalc.calc(x, y)
            if (canvas_buffer && canvas_buffer[canvas_x] && canvas_buffer[canvas_x][canvas_y]) {
               canvas_buffer[canvas_x][canvas_y] = [pattern, iteration]
            }
            const [hue, sat_pct, lum_pct] =
               FractoUtil.fracto_pattern_color_hsl(pattern, iteration)
            ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
            ctx.fillRect(canvas_x, canvas_y, 2, 2);
         }
      }
   }
}

export const fill_canvas_buffer = (
   canvas_buffer, ctx,
   width_px, focal_point, scope,
   final_callback,
   aspect_ratio = 1, on_plan_complete = null, filter_level = null) => {

   let all_short_codes = []
   const all_level_sets = []
   get_tiles(width_px, focal_point, scope, aspect_ratio)
      .forEach(level_set => {
         if (filter_level && filter_level !== level_set.level) {
            return;
         }
         const level_short_codes = level_set.level_tiles
            .map(tile => tile.short_code)
         all_short_codes = all_short_codes.concat(level_short_codes)
         all_level_sets.push(level_set)
      })
   if (!all_short_codes.length) {
      return;
   }
   setTimeout(() => {
      FractoMruCache.get_tiles_async(all_short_codes, when_complete => {
         const level_data_sets = all_level_sets
            .map(level_set => {
               const tile_width =
                  level_set.level_tiles[0].bounds.right
                  - level_set.level_tiles[0].bounds.left
               level_set.tile_increment = tile_width / 256
               return level_set
            })
            .sort((a, b) => a.level > b.level ? -1 : 1)
         raster_fill(canvas_buffer, level_data_sets, ctx, width_px, focal_point, scope, aspect_ratio)
         if (on_plan_complete) {
            on_plan_complete(canvas_buffer, ctx)
         }
         final_callback()
      })
   }, 10)
}
