import Complex from "common/math/Complex";

const MAX_ITERATION = 10000
const MIN_ITERATION = 5000
const MIN_DELTA = 0.0000001
const MAX_ACCEPTED = 0.01

export class FractoFastCalc {

   static confirm_pattern = (pattern, P_x, P_y, Q_x0, Q_y0, countdown = 3) => {
      let Q_x = Q_x0
      let Q_y = Q_y0
      let Q_x_squared = Q_x * Q_x
      let Q_y_squared = Q_y * Q_y
      const Q = new Complex(Q_x, Q_y)
      const Q0_mag = Q.magnitude()
      let negative_Q0 = Q.scale(-1)
      let double_M = new Complex(Q_x * 2, Q_y * 2)
      let product = double_M
      for (let iterations = 0; iterations < pattern; iterations++) {
         Q_y = 2 * Q_x * Q_y + P_y;
         Q_x = Q_x_squared - Q_y_squared + P_x;
         if (iterations < pattern - 1) {
            double_M = new Complex(Q_x * 2, Q_y * 2)
            product = product.mul(double_M)
         }
         Q_x_squared = Q_x * Q_x
         Q_y_squared = Q_y * Q_y
         if (Q_x_squared + Q_y_squared > 10) {
            // console.log(`${pattern} bailed in ${iterations}`)
            return 100;
         }
      }
      const M = new Complex(Q_x, Q_y)
      const numerator = M.add(negative_Q0)
      const denominator = product.offset(-1, 0)
      const delta = numerator.divide(denominator)
      const delta_mag = delta.magnitude() / Q0_mag
      // console.log("confirming pattern=", pattern)
      if (delta_mag === 0) {
         // console.log("confirmed! countdown=", countdown)
         // console.log(`${pattern} confirmed! countdown=${countdown}`)
         return delta_mag
      }
      if (countdown === 0) {
         // console.log(`${pattern} not the one delta_mag=${delta_mag}`)
         return delta_mag
      }
      // console.log("try again", delta_mag)
      return FractoFastCalc.confirm_pattern(pattern, P_x, P_y, Q_x0 - delta.re, Q_y0 - delta.im, countdown - 1)
   }

   static calc = (x0, y0) => {
      // const P = new Complex(x, y)
      const P_x = x0
      const P_y = y0
      let Q_x_squared = 0
      let Q_y_squared = 0
      let Q_x = 0
      let Q_y = 0

      // let Q = new Complex(0, 0)
      let product = new Complex(0, 0)
      let Q0 = new Complex(0, 0)
      let negative_Q0 = new Complex(0, 0)
      let iterations = 0
      let test_pattern = 0
      let Q_mag = 0
      const best_patterns = []
      for (; iterations < MAX_ITERATION; iterations++) {

         Q_y = 2 * Q_x * Q_y + P_y;
         Q_x = Q_x_squared - Q_y_squared + P_x;
         Q_x_squared = Q_x * Q_x
         Q_y_squared = Q_y * Q_y
         if (Q_x_squared + Q_y_squared > 100) {
            return {
               pattern: 0,
               iteration: iterations,
            };
         }
         if (iterations < MIN_ITERATION) {
            continue;
         }

         const M = new Complex(Q_x, Q_y)
         const double_M = new Complex(Q_x * 2, Q_y * 2)
         if (test_pattern === 0) {
            product = double_M
            Q0 = new Complex(Q_x, Q_y)
            negative_Q0 = Q0.scale(-1)
            Q_mag = M.magnitude()
         } else {
            const numerator = M.add(negative_Q0)
            const denominator = product.offset(-1, 0)
            const delta = numerator.divide(denominator)
            const delta_mag = delta.magnitude()
            if (delta_mag === 0) {
               return {
                  pattern: test_pattern,
                  iteration: 1000,
               };
            } else if (delta_mag !== -1 && delta_mag < 0.001) {
               const delta_portion = delta_mag / Q_mag
               best_patterns.push({
                  pattern: test_pattern,
                  test_Q: new Complex(Q0.re - delta.re, Q0.im - delta.im),
                  delta: delta_portion
               })
            }
            product = product.mul(double_M)
         }
         test_pattern++
      }
      const sorted_tests = best_patterns.sort((a, b) => {
         return a.delta > b.delta ? 1 : -1
      }).slice(0, 20)
      for (let i = 0; i < sorted_tests.length; i++) {
         const test = sorted_tests[i]
         test.confirmation = FractoFastCalc.confirm_pattern(test.pattern, P_x, P_y, test.test_Q.re, test.test_Q.im)
      }
      const best_results = best_patterns.sort((a, b) => {
         return a.confirmation < b.confirmation ? -1 : 1
      })
      // console.log("best_results", best_results)

      return {
         pattern: best_results.length ? best_results[0].pattern : 0,
         iteration: best_results.length ? 1000 : iterations,
      };
   }
}

export default FractoFastCalc
