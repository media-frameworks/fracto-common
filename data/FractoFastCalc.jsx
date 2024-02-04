import Complex from "common/math/Complex";

const MAX_ORBITAL_SIZE = 25000
const MIN_ITERATION = 1000000
const MAX_ITERATION = MIN_ITERATION + MAX_ORBITAL_SIZE

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

   static calc = (x0, y0) => {

      const P_x = x0
      const P_y = y0
      let Q_x_squared = 0
      let Q_y_squared = 0
      let Q_x = 0
      let Q_y = 0

      let product = null
      let sum = null
      let least_magnitude = 1
      let orbital = -1
      let iteration = 0
      let min_iteration = MIN_ITERATION
      for (; iteration < MAX_ITERATION; iteration++) {
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

         if (iteration < min_iteration) {
            continue
         }
         if (iteration === min_iteration) {
            sum = new Complex(Q_x, Q_y)
            product = new Complex(1, 0)
            continue
         }

         sum = sum.offset(Q_x, Q_y)
         product = product.mul(sum)
         const product_minus_one = product.offset(-1, 0)
         const magnitude = product_minus_one.magnitude()
         if (magnitude < least_magnitude) {
            least_magnitude = magnitude
            orbital = iteration - min_iteration
         }
         sum = new Complex(Q_x, Q_y)

      }

      return {
         pattern: orbital,
         iteration: iteration,
         Q_s: []
      };
   }
}

export default FractoFastCalc
