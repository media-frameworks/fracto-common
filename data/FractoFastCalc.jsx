import Complex from "common/math/Complex";

const MAX_ITERATION = 5000
const MIN_ITERATION = 1000
const MIN_DELTA = 0.000000001

export class FractoFastCalc {

   static calc = (x, y) => {
      const P = new Complex(x, y)

      let Q = new Complex(0, 0)
      let product = new Complex(0, 0)
      let negative_Q0 = new Complex(0, 0)
      let pattern = 0
      let iterations = 0
      let test_pattern = 0
      let best_delta = 1000
      for (; iterations < MAX_ITERATION; iterations++) {
         const Q_squared = Q.mul(Q)
         Q = Q_squared.add(P)
         if (Q.magnitude() > 10) {
            break;
         }
         if (iterations < MIN_ITERATION) {
            continue;
         }

         const M = new Complex(Q.re, Q.im)
         const double_M = M.scale(2)
         if (test_pattern === 0) {
            product = double_M
            negative_Q0 = Q.scale(-1)
         } else {
            const numerator = M.add(negative_Q0)
            const denominator = product.offset(-1, 0)
            const delta = numerator.divide(denominator)
            const delta_mag = delta.magnitude()
            if (delta_mag < best_delta && delta_mag !== -1) {
               best_delta = delta_mag
               pattern = test_pattern
               console.log("pattern, best_delta", pattern, best_delta)
               if (best_delta < MIN_DELTA) {
                  break;
               }
            }
            product = product.mul(double_M)
         }
         test_pattern++
      }
      return {
         pattern: pattern,
         iteration: iterations,
      };
   }
}

export default FractoFastCalc
