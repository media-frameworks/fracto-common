import React from 'react';

export class FractoCalc {

   static calc = (x0, y0, max_iteration = 1000000, seed_x = 0, seed_y = 0) => {
      let x = seed_x;
      let y = seed_y;
      let iteration = 1;
      let x_squared = x * x;
      let y_squared = y * y;
      let pattern = 0;
      let position_slug = `${x},${y}`;
      const previously = {position_slug: iteration};
      while (x_squared + y_squared < 100 && iteration < max_iteration) {
         y = 2 * x * y + y0;
         x = x_squared - y_squared + x0;
         position_slug = `${x},${y}`;
         if (previously[position_slug] && iteration > 10) {
            pattern = iteration - previously[position_slug];
            break;
         } else {
            previously[position_slug] = iteration;
         }
         x_squared = x * x;
         y_squared = y * y;
         iteration++;
      }
      if (iteration >= max_iteration) {
         console.log("max_iteration", x0, y0)
         pattern = -1;
      }
      return {
         x: x0,
         y: y0,
         pattern: pattern,
         iteration: iteration
      };
   }

}

export default FractoCalc;

