import Complex from "common/math/Complex";

const MAX_ORBITAL_SIZE = 25000
const MIN_ITERATION = 1200000

export class FractoFastCalc {

   static point_in_main_cardioid = (x0, y0) => {
      const P = new Complex(x0, y0)
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

   static calc = (x0, y0, level = 10) => {
      const P_x = x0
      const P_y = y0
      let Q_x_squared = 0
      let Q_y_squared = 0
      let Q_x = 0
      let Q_y = 0
      let first_pos = {}
      let orbital = 0
      let least_magnitude = 1
      let best_orbital = 0
      let iteration = 1
      const iteration_factor = (MIN_ITERATION * level / 3) + MAX_ORBITAL_SIZE
      const max_iteration = Math.round(iteration_factor / MAX_ORBITAL_SIZE) * MAX_ORBITAL_SIZE
      for (; iteration < max_iteration; iteration++) {
         Q_y = 2 * Q_x * Q_y + P_y;
         Q_x = Q_x_squared - Q_y_squared + P_x;
         Q_x_squared = Q_x * Q_x
         Q_y_squared = Q_y * Q_y
         if (Q_x_squared + Q_y_squared > 100) {
            return {
               pattern: 0,
               iteration: iteration,
            };
         }
         if (iteration % MAX_ORBITAL_SIZE === 0) {
            first_pos = {x: Q_x, y: Q_y}
            orbital = 0
         } else if (iteration > MAX_ORBITAL_SIZE) {
            orbital++
            if (Q_x === first_pos.x && Q_y === first_pos.y) {
               const orbital_points = []
               for (let i = 0; i < orbital + 1; i++) {
                  Q_y = 2 * Q_x * Q_y + P_y;
                  Q_x = Q_x_squared - Q_y_squared + P_x;
                  Q_x_squared = Q_x * Q_x
                  Q_y_squared = Q_y * Q_y
                  orbital_points.push({
                     x: Q_x,
                     y: Q_y
                  })
               }
               if (iteration < 60000) {
                  iteration = FractoFastCalc.best_iteration(orbital, x0, y0)
               }
               return {
                  pattern: orbital,
                  iteration: iteration,
                  orbital_points: orbital_points
               };
            }
         }

         if (iteration > max_iteration - MAX_ORBITAL_SIZE) {
            const difference = new Complex(Q_x - first_pos.x, Q_y - first_pos.y)
            const mag_difference = difference.magnitude()
            if (mag_difference < least_magnitude) {
               least_magnitude = mag_difference
               best_orbital = orbital
            }
         }
      }
      return {
         pattern: best_orbital,
         iteration: iteration,
         Q_s: []
      };
   }

   static best_iteration = (pattern, x, y) => {
      const P_x = x
      const P_y = y
      let Q_x_squared = 0
      let Q_y_squared = 0
      let Q_x = 0
      let Q_y = 0
      let first_pos_x = x
      let first_pos_y = y
      for (let iteration = 0; iteration < 60000; iteration++) {
         Q_y = 2 * Q_x * Q_y + P_y;
         Q_x = Q_x_squared - Q_y_squared + P_x;
         Q_x_squared = Q_x * Q_x
         Q_y_squared = Q_y * Q_y
         if (iteration % pattern === 0 && iteration) {
            if (Q_x === first_pos_x && Q_y === first_pos_y) {
               return iteration
            }
            first_pos_x = Q_x
            first_pos_y = Q_y
         }
      }
      return -1
   }

}

export default FractoFastCalc
