import FractoUtil from "../FractoUtil";

const MAX_PATTERN = 20000

export class FractoColors {

   static pattern_hues = null

   static init_pattern_hues = () => {
      FractoColors.pattern_hues = new Array(MAX_PATTERN).fill(0)
      for (let pattern = 1; pattern < MAX_PATTERN; pattern++) {
         const log2 = Math.log2(pattern);
         FractoColors.pattern_hues[pattern] = Math.floor(360 * (log2 - Math.floor(log2)))
      }
   }

   static pattern_hue = (pattern) => {
      if (!FractoColors.pattern_hues) {
         FractoColors.init_pattern_hues()
      }
      let pattern_in_range = pattern
      while (pattern_in_range > MAX_PATTERN) {
         pattern_in_range /= 2
      }
      return FractoColors.pattern_hues[pattern_in_range]
   }

   static pattern_color_hsl = (pattern, iteration, distance_to_center) => {
      return FractoUtil.fracto_pattern_color_hsl(pattern, iteration)
   }
}

export default FractoColors
