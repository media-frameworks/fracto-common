import Complex from "common/math/Complex";

const TILE_KEY_ROW_INDEX = 'row_index'
const TILE_KEY_COL_INDEX = 'col_index'
const TILE_KEY_CARDINALITY = 'cardinality'
const TILE_KEY_CYCLES = 'cycles'
const TILE_KEY_MAGNITUDE = 'magnitude'
const TILE_KEY_IN_CARDIOID = 'in_cardioid'
const TILE_KEY_SEED_RE = 'seed_re'
const TILE_KEY_SEED_IM = 'seed_im'
const TILE_KEY_ITERATIONS = 'iterations'

const CSV_COLUMNS = [
   TILE_KEY_ROW_INDEX,
   TILE_KEY_COL_INDEX,
   TILE_KEY_CARDINALITY,
   TILE_KEY_CYCLES,
   TILE_KEY_MAGNITUDE,
   TILE_KEY_IN_CARDIOID,
   TILE_KEY_SEED_RE,
   TILE_KEY_SEED_IM,
   TILE_KEY_ITERATIONS,
]

export class FractoTileDetail {

   static get_magnitude = (point_set, center) => {
      if (!point_set) {
         return []
      }
      let max_radius = 0
      point_set.forEach((point, i) => {
         const diff_x = point.x - center.re
         const diff_y = point.y - center.im
         const magnitude = Math.sqrt(diff_x * diff_x + diff_y * diff_y)
         if (max_radius < magnitude) {
            max_radius = magnitude
         }
      })
      return 2 * max_radius
   }

   static get_cycles = (point_set, center) => {
      let current_theta = -1
      let first_theta = 0
      point_set.forEach((point, i) => {
         const diff_x = point.x - center.re
         const diff_y = point.y - center.im
         let theta = Math.atan2(diff_y, diff_x)
         while (theta < current_theta) {
            theta += Math.PI * 2
         }
         if (current_theta === -1) {
            first_theta = theta
         }
         current_theta = theta
      })
      return Math.round((current_theta - first_theta) / (2 * Math.PI))
   }

   static get_orbital_points = (x0, y0, pattern) => {
      const P_x = x0
      const P_y = y0
      let Q_x_squared = 0
      let Q_y_squared = 0
      let Q_x = 0
      let Q_y = 0
      const orbital_points = new Array(pattern).fill({x:0,y:0})
      let i = 0
      for (; i < 10000000; i++) {
         Q_y = 2 * Q_x * Q_y + P_y;
         Q_x = Q_x_squared - Q_y_squared + P_x;
         Q_x_squared = Q_x * Q_x
         Q_y_squared = Q_y * Q_y
         if (orbital_points[i % pattern].x === Q_x && orbital_points[i % pattern].y === Q_y) {
            return [orbital_points, i]
         }
         orbital_points[i % pattern].x = Q_x
         orbital_points[i % pattern].y = Q_y
      }
      return [orbital_points, i]
   }

   static point_in_main_cardioid = (p) => {
      const P = new Complex(p.re || p.x, p.im || p.y)
      const negative_four_P = P.scale(-4)
      const one_minus_four_p = negative_four_P.offset(1, 0)
      const sqrt_one_minus_four_p = one_minus_four_p.sqrt()
      const negative_sqrt_one_minus_four_p = sqrt_one_minus_four_p.scale(-1)
      const one_minus_sqrt_one_minus_four_p = negative_sqrt_one_minus_four_p.offset(1, 0)
      const magnitude = one_minus_sqrt_one_minus_four_p.magnitude()
      if (magnitude < 0) {
         return false
      }
      return magnitude <= 1;
   }

   static Q_scalar = (p, scalar = -1) => {
      const P = new Complex(p.re || p.x, p.im || p.y)
      const negative_four_P = P.scale(-4.0)
      const under_radical = negative_four_P.offset(1, 0)
      const radical = under_radical.sqrt().scale(scalar)
      return radical.offset(1.0, 0).scale(0.5)
   }

   static detail_point_data = (re, im, pattern, img_x, img_y) => {
      const P = new Complex(re, im)
      const center = FractoTileDetail.Q_scalar(P)
      const in_cardioid = FractoTileDetail.point_in_main_cardioid(P)
      const [orbital_points, iteration] = FractoTileDetail.get_orbital_points(re, im, pattern)
      const cycles = FractoTileDetail.get_cycles(orbital_points, center)
      const magnitude = FractoTileDetail.get_magnitude(orbital_points, center)
      return {
         [TILE_KEY_SEED_RE]: orbital_points[0].x,
         [TILE_KEY_SEED_IM]: orbital_points[0].y,
         [TILE_KEY_CARDINALITY]: pattern,
         [TILE_KEY_CYCLES]: cycles,
         [TILE_KEY_MAGNITUDE]: magnitude,
         [TILE_KEY_IN_CARDIOID]: in_cardioid,
         [TILE_KEY_ITERATIONS]: iteration,
         [TILE_KEY_ROW_INDEX]: img_y,
         [TILE_KEY_COL_INDEX]: img_x,
      }
   }

   static begin = (tile, tile_points, cb) => {
      console.log('FractoTileDetail.begin tile_data', tile_points)
      const level = tile.short_code.length
      const increment = (tile.bounds.right - tile.bounds.left) / 256.0;
      const csv_rows = []
      csv_rows.push(CSV_COLUMNS.join(','))
      for (let img_x = 0; img_x < 256; img_x++) {
         const x = tile.bounds.left + img_x * increment;
         for (let img_y = 0; img_y < 256; img_y++) {
            const [pattern, iteration] = tile_points[img_x][img_y]
            if (!pattern) {
               continue
            }
            const y = tile.bounds.top - img_y * increment;
            const point_data = FractoTileDetail.detail_point_data(x, y, pattern, img_x, img_y)
            csv_rows.push(`
               ${point_data[TILE_KEY_ROW_INDEX]},
               ${point_data[TILE_KEY_COL_INDEX]},
               ${point_data[TILE_KEY_CARDINALITY]},
               ${point_data[TILE_KEY_CYCLES]},
               ${point_data[TILE_KEY_MAGNITUDE]},
               ${point_data[TILE_KEY_IN_CARDIOID]},
               ${point_data[TILE_KEY_SEED_RE]},
               ${point_data[TILE_KEY_SEED_IM]},
               ${point_data[TILE_KEY_ITERATIONS]}
            `)
         }
      }
      const full_history = `${csv_rows.length} deatiled, in ${seconds}s`
      setTimeout(() => {
         cb(full_history, csv_rows)
      }, 150)
   }
}

export default FractoTileDetail
