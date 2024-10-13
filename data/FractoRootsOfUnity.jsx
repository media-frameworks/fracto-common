export class FractoRootsOfUnity {
   static roots_table_a = []
   static roots_table_b = []

   static initialize = () => {
      if (FractoRootsOfUnity.roots_table_a.length) {
         return [
            FractoRootsOfUnity.roots_table_a,
            FractoRootsOfUnity.roots_table_b
         ]
      }
      FractoRootsOfUnity.roots_table_a = [
         {cardinality: 1, coefficients: [1]},
         {cardinality: 2, coefficients: [1]},
         {cardinality: 3, coefficients: [1, -1]},
         {cardinality: 4, coefficients: [1, -2]},
         {cardinality: 5, coefficients: [1, -3, 1]},
         {cardinality: 6, coefficients: [1, -4, 3]},
         {cardinality: 7, coefficients: [1, -5, 6, -1]},
         {cardinality: 8, coefficients: [1, -6, 10, -4]},
         {cardinality: 9, coefficients: [1, -7, 15, -10, 1]},
         {cardinality: 10, coefficients: [1, -8, 21, -20, 5]},
      ]
      FractoRootsOfUnity.roots_table_b = [
         {cardinality: 1, coefficients: [1]},
         {cardinality: 2, coefficients: [1, -2]},
         {cardinality: 3, coefficients: [1, -3]},
         {cardinality: 4, coefficients: [1, -4, 2]},
         {cardinality: 5, coefficients: [1, -5, 5]},
         {cardinality: 6, coefficients: [1, -6, 9, -2]},
         {cardinality: 7, coefficients: [1, -7, 14, -7]},
         {cardinality: 8, coefficients: [1, -8, 20, -16, 2]},
         {cardinality: 9, coefficients: [1, -9, 27, -30, 9]},
         {cardinality: 10, coefficients: [1, -10, 35, -50, 25, -2]},
      ]
      return [
         FractoRootsOfUnity.roots_table_a,
         FractoRootsOfUnity.roots_table_b
      ]
   }
}

export default FractoRootsOfUnity
