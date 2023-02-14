import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

// import Complex from "complex.js";
import {create, all} from 'mathjs'
import Decimal from 'decimal.js';

import {AppStyles} from "app/AppImports";
import StoreS3 from "common/StoreS3";
import Utils from "common/Utils";
import BigComplex from "common/math/BigComplex";
import BigTrig from "common/math/BigTrig";

import csv_files from "../../../data/fracto/csv_files.json";

const config = {};
const math = create(all, config)
math.config({
   number: 'BigNumber',      // Default type of number:
                             // 'number' (default), 'BigNumber', or 'Fraction'
   precision: 512,            // Number of significant digits for BigNumbers
   epsilon: 1e-500
})

const SLUG_PRECISION = 500;

Decimal.set({ precision: 500 })

export class FractoCalc extends Component {

   static propTypes = {
      init_code: PropTypes.string.isRequired,
      seed_x: PropTypes.number.isRequired,
      seed_y: PropTypes.number.isRequired,
      frame_width: PropTypes.number.isRequired,
      level_depth: PropTypes.number.isRequired,
      max_iterations: PropTypes.number.isRequired,
   }

   static cache = {}

   componentDidMount() {
      csv_files.shift();
      csv_files.shift();
      csv_files.shift();
      console.log("csv_files", csv_files);
   }

   process_cache = () => {
      const {init_code, seed_x, seed_y, frame_width, level_depth, max_iterations} = this.props;
      const cache_array = this.cache_file(init_code, seed_x, seed_y, frame_width, level_depth, max_iterations)
      const expandables = cache_array.filter((entry, index) => {
         if (index === 0) {
            return false;
         }
         if (entry.code.length === level_depth * 2 + 1) {
            return true;
         }
         return false;
      });
      console.log("expandables.length", expandables.length);

      const prefix = "[";
      const suffix = "].csv";
      const all_files = csv_files.map(file => file.replace(prefix, '').replace(suffix, ''));
      console.log("all_files", all_files)

      const shuffled = Utils.shuffle(expandables);
      for (let i = 0; i < shuffled.length; i++) {
         const entry = shuffled[i];
         if (all_files.includes(entry.code)) {
            console.log("found code, continuing", entry.code, i);
            continue;
         }
         this.cache_file(entry.code, entry.x, entry.y, entry.width, 8, max_iterations)
      }

   }

   cache_file = (init_code, seed_x, seed_y, frame_width, level_depth, max_iterations) => {
      const cache = Object.assign({}, {});
      const root_node = FractoCalc.calc(seed_x, seed_y, max_iterations);
      cache[init_code] = Object.assign({code: init_code, width: frame_width}, root_node);
      this.fill_frame(cache, init_code, seed_x, seed_y, frame_width, level_depth, max_iterations);
      const cache_array = Object.keys(cache)
         .map(key => cache[key])
         .sort((a, b) => {
            if (a.x > b.x) {
               return 1;
            }
            if (a.x < b.x) {
               return -1;
            }
            if (a.x === b.x) {
               if (a.y > b.y) {
                  return -1;
               }
            }
            return 1;
         });

      let in_set = false;
      for (let i = 0; i < cache_array.length; i++) {
         if (cache_array[i].pattern > 0) {
            in_set = true;
            break;
         }
      }
      if (!in_set) {
         return [];
      }

      const csv = Utils.json_to_csv(cache_array);
      const file_name = "data_csv/[" + init_code + "].csv";
      console.log("file_name", file_name)

      StoreS3.put_file_async(file_name, csv, "fracto", result => {
         console.log("put_file_async result", result);
      });
      return cache_array;
   }

   expand_nodes = (nodes) => {
      const {max_iterations} = this.props;
      nodes.forEach(node => {
         FractoCalc.calc(node.x, node.y, max_iterations * 10);
      });
   }

   state = {
      root_node: {}
   };

   fill_frame = (cache, code, x, y, width, depth, max_iterations) => {
      const width_by_2 = width / 2;

      const code_00 = code.split(',').map((part, index) => `${part}0`).join(',')
      if (!cache[code_00]) {
         const node_00 = FractoCalc.calc(x, y, max_iterations);
         cache[code_00] = Object.assign({code: code_00, width: width_by_2}, node_00);
      }

      const code_01 = code.split(',').map((part, index) => `${part}${index}`).join(',')
      if (!cache[code_01]) {
         const node_01 = FractoCalc.calc(x + width_by_2, y, max_iterations);
         cache[code_01] = Object.assign({code: code_01, width: width_by_2}, node_01);
      }

      const code_10 = code.split(',').map((part, index) => `${part}${1 - index}`).join(',')
      if (!cache[code_10]) {
         const node_10 = FractoCalc.calc(x, y - width_by_2, max_iterations);
         cache[code_10] = Object.assign({code: code_10, width: width_by_2}, node_10);
      }

      const code_11 = code.split(',').map((part, index) => `${part}1`).join(',')
      if (!cache[code_11]) {
         const node_11 = FractoCalc.calc(x + width_by_2, y - width_by_2, max_iterations);
         cache[code_11] = Object.assign({code: code_11, width: width_by_2}, node_11);
      }

      const new_depth = depth - 1;
      if (new_depth === 1) {
         return;
      }

      this.fill_frame(cache, code_00, x, y, width_by_2, new_depth, max_iterations);
      this.fill_frame(cache, code_01, x + width_by_2, y, width_by_2, new_depth, max_iterations);
      this.fill_frame(cache, code_10, x, y - width_by_2, width_by_2, new_depth, max_iterations);
      this.fill_frame(cache, code_11, x + width_by_2, y - width_by_2, width_by_2, new_depth, max_iterations);
   }

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

   static bignum_calc = (x0, y0, max_iteration = 1000000, seed_x = 0, seed_y = 0) => {
      let x = math.bignumber(seed_x);
      let y = math.bignumber(seed_y);
      let x0_big = math.bignumber(x0);
      let y0_big = math.bignumber(y0);
      let iteration = 1;
      let x_squared = math.chain(x).multiply(x).valueOf();
      let y_squared = math.chain(y).multiply(y).valueOf();
      let sum_squared_x_y = math.add(x_squared, y_squared);
      let pattern = 0;
      const previously = {};
      while (math.smaller(sum_squared_x_y, 100) && iteration < max_iteration) {
         y = math.chain(2).multiply(x).multiply(y).add(y0_big).valueOf();
         x = math.chain(x_squared).subtract(y_squared).add(x0_big).valueOf();
         const position_slug = `${x.toString().substr(0, SLUG_PRECISION)},${y.toString().substr(0, SLUG_PRECISION)}`;
         if (previously[position_slug] && iteration > 10) {
            pattern = iteration - previously[position_slug];
            break;
         } else {
            previously[position_slug] = iteration;
         }
         x_squared = math.chain(x).multiply(x).valueOf();
         y_squared = math.chain(y).multiply(y).valueOf();
         sum_squared_x_y = math.add(x_squared, y_squared);
         iteration++;
      }
      if (iteration >= max_iteration) {
         console.log("max_iteration", x0_big, y0_big)
         pattern = -1;
      }
      return {
         x: x0_big,
         y: y0_big,
         pattern: pattern,
         iteration: iteration
      };
   }

   static bignum_step = (z, r_ei_theta) => {

      const z_first = new BigComplex(z.re, z.im);
      let orbital = 0;
      let Z = z;
      let z0_test = z;
      for (; orbital < 20; orbital++) {
         z0_test = Z.mul(Z).offset(r_ei_theta.re, r_ei_theta.im);
         if (z0_test.compare(z_first)) {
            return orbital;
         }
         console.log("z0_test", z0_test.toString())
         Z = z0_test;
      }
      return 0;
   }

   static fast_calc_not = (x0, y0, test_iteration = 100) => {

      const big_x0 = math.bignumber(x0);
      const big_y0 = math.bignumber(y0);
      let x0_squared = math.chain(big_x0).multiply(big_x0).valueOf();
      let y0_squared = math.chain(big_y0).multiply(big_y0).valueOf();

      const r = math.bignumber(math.chain(x0_squared).add(y0_squared).sqrt().valueOf());
      console.log("r", r.toString())

      const theta = math.bignumber(math.atan2(big_y0, big_x0));
      console.log("theta", theta.toString())

      const e_i_theta = math.complex(0, theta);
      // console.log("e_i_theta", e_i_theta.toString())

      const e_i_theta_exp = math.exp(e_i_theta)
      // console.log("e_i_theta_exp", e_i_theta_exp.toString())

      const r_ei_theta = new BigComplex(e_i_theta_exp.re, e_i_theta_exp.im).scale(r);
      // console.log("r_ei_theta", r_ei_theta.re.toString(), r_ei_theta.im.toString())

      const z0_big = r_ei_theta.scale(-4).offset(1, 0).sqrt().scale(1).offset(1, 0).scale(0.5);
      // console.log("z0_big", z0_big.toString())

      const z1_big = r_ei_theta.scale(-4).offset(1, 0).sqrt().scale(-1).offset(1, 0).scale(0.5);
      // console.log("z1_big", z1_big.toString())

      const z2_big = r_ei_theta.scale(-4).offset(-3, 0).sqrt().scale(1).offset(-1, 0).scale(0.5);
      // console.log("z2_big", z2_big.toString())

      const z3_big = r_ei_theta.scale(-4).offset(-3, 0).sqrt().scale(-1).offset(-1, 0).scale(0.5);
      // console.log("z3_big", z3_big.toString())

      // const z0 = math.chain(e_i_theta_exp).multiply(r).multiply(-4).add(1).sqrt().multiply(1).add(1).multiply(0.5).valueOf();
      // const z1 = math.chain(e_i_theta_exp).multiply(r).multiply(-4).add(1).sqrt().multiply(-1).add(1).multiply(0.5).valueOf();
      // const z2 = math.chain(e_i_theta_exp).multiply(r).multiply(-4).add(-3).sqrt().multiply(1).add(-1).multiply(0.5).valueOf();
      // const z3 = math.chain(e_i_theta_exp).multiply(r).multiply(-4).add(-3).sqrt().multiply(-1).add(-1).multiply(0.5).valueOf();

      const result0 = FractoCalc.bignum_step(z0_big, r_ei_theta);
      const result1 = FractoCalc.bignum_step(z1_big, r_ei_theta);
      const result2 = FractoCalc.bignum_step(z2_big, r_ei_theta);
      const result3 = FractoCalc.bignum_step(z3_big, r_ei_theta);
      // let z0_test = Complex(0, theta).exp().multiply(r).multiply(-4).add(1).sqrt().add(1).multiply(0.5);
      //

      // const result0 = FractoCalc.bignum_calc(big_x0, big_y0, 1000000, z0_big.re, z0_big.im)
      // const result1 = FractoCalc.bignum_calc(big_x0, big_y0, 1000000, z1_big.re, z1_big.im)
      // const result2 = FractoCalc.bignum_calc(big_x0, big_y0, 1000000, z2_big.re, z2_big.im)
      // const result3 = FractoCalc.bignum_calc(big_x0, big_y0, 1000000, z3_big.re, z3_big.im)

      // console.log("orbital", orbital)
      console.log("z0", z0_big.toString(), result0)
      console.log("z1", z1_big.toString(), result1)
      console.log("z2", z2_big.toString(), result2)
      console.log("z3", z3_big.toString(), result3)

      return {
         x: big_x0,
         y: big_y0,
         r: r,
         theta: theta,
         // result: result1,
      };

   }

   static make_big_complex_r_e_i_theta = (r, theta) => {

      const e_i_theta = new BigComplex(0, theta);
      console.log("e_i_theta", e_i_theta.toString())

      const e_i_theta_exp = e_i_theta.exp()
      console.log("e_i_theta_exp", e_i_theta_exp.toString())

      const r_ei_theta = e_i_theta_exp.scale(r);
      console.log("r_ei_theta", r_ei_theta.toString())

      return r_ei_theta;
   }

   static theta_from_Q_not = (Q, factor) => {

      const big_R = math.distance([0, 0], [Q.re, Q.im]);
      console.log("big_R", big_R.toString())

      const phi = math.bignumber(math.atan2(Q.im, Q.re));
      console.log("phi", phi.toString())

      const e_three_phi_i = new BigComplex(0, math.multiply(3, phi)).exp();
      const e_four_phi_i = new BigComplex(0, math.multiply(4, phi)).exp();

      const minus_big_R = math.multiply(big_R, -1);
      const minus_big_R_e_four_phi_i = e_four_phi_i.scale(minus_big_R);
      const num = e_three_phi_i.offset(minus_big_R_e_four_phi_i.re, minus_big_R_e_four_phi_i.im).sqrt()

      const e_i_phi = new BigComplex(0, phi).exp();
      const den = e_i_phi.offset(minus_big_R, 0).sqrt()

      const log_operand = num.divide(den).scale(factor);
      const i = new BigComplex(0, 1);
      const theta = log_operand.log().mul(i).scale(-1);

      return theta;
   }

   static P1_from_Q = (x0, y0) => {

      const big_x0 = math.bignumber(x0);
      const big_y0 = math.bignumber(y0);

      const big_R = math.distance([0, 0], [big_x0, big_y0]);
      console.log("big_R", big_R.toString())

      const big_R_squared = math.multiply(big_R, big_R);

      const phi_slope = math.divide(big_y0, big_x0);
      const phi = BigTrig.atan(phi_slope);
      const two_phi = math.multiply(phi, 2);

      const d_phi = new Decimal(phi)
      const sin_phi = d_phi.sin();
      const big_R_sin_phi = math.multiply(big_R, sin_phi);

      const d_two_phi = new Decimal(two_phi)
      const sin_two_phi = d_two_phi.sin();
      const big_R_squared_sin_two_phi = math.multiply(big_R_squared, sin_two_phi);
      const im_part = math.chain(-1).subtract(big_R_sin_phi).subtract(big_R_squared_sin_two_phi).valueOf();

      const cos_phi = d_phi.cos();
      const big_R_cos_phi = math.multiply(big_R, cos_phi);
      const cos_two_phi = d_two_phi.cos();
      const big_R_squared_cos_two_phi = math.multiply(big_R_squared, cos_two_phi);
      const re_part = math.chain(-1).subtract(big_R_cos_phi).subtract(big_R_squared_cos_two_phi).valueOf();

      return new BigComplex(re_part, im_part);
   }

   static fast_calc_bignumber = (x0, y0, test_iteration = 100) => {

      const Q = new BigComplex(x0, y0);
      console.log("Q", Q.toString())

      const minus_Q_squared = Q.mul(Q).scale(-1);
      console.log("minus_Q_squared", minus_Q_squared.toString())

      const minus_one = new BigComplex(-1, 0);
      const minus_Q = Q.scale(-1);



      // const P1_re_number = math.number(math.number(P1.re));
      // const P1_im_number = math.number(math.number(P1.im));
      //
      // const calc_result1_no_seed = FractoCalc.bignum_calc(P1_re_number, P1_im_number, 1000000);
      // console.log("calc_result1_no_seed", calc_result1_no_seed)
      //
      // const calc_result1 = FractoCalc.bignum_calc(P1_re_number, P1_im_number, 1000000, x0, y0);
      // console.log("calc_result1", calc_result1)
      //
      // const normal_calc_result1 = FractoCalc.calc(P1_re_number, P1_im_number, 1000000);
      // console.log("normal_calc_result1", normal_calc_result1)
      //
      // const normal_calc_result1_with_seeds = FractoCalc.calc(P1_re_number, P1_im_number, 1000000, x0, y0);
      // console.log("normal_calc_result1_with_seeds", normal_calc_result1_with_seeds)

      const Q1 = new BigComplex(x0, y0);
      console.log("Q1", Q1.toString())

      const P1 = Q1.offset(minus_Q_squared.re, minus_Q_squared.im);
      console.log("P1", P1.toString())

      const calc_steps1 = FractoCalc.calc_steps_big(Q1, P1)
      console.log("calc_steps1", calc_steps1)


      const P2 = minus_one
         .offset(minus_Q.re, minus_Q.im)
         .offset(minus_Q_squared.re, minus_Q_squared.im);
      console.log("P2", P2.toString())

      const calc_steps2 = FractoCalc.calc_steps_big(Q1, P2)
      console.log("calc_steps2", calc_steps2)
      const Q2 = Q1.mul(Q1).offset(P2.re, P2.im)
      console.log("Q2", Q2.toString())


      const minus_Q1_squared = Q1.mul(Q1).scale(-1);
      const P3 = Q2.offset(minus_Q1_squared.re, minus_Q1_squared.im)
      console.log("P3", P3.toString())

      const calc_steps3 = FractoCalc.calc_steps_big(Q1, P3)
      console.log("calc_steps3", calc_steps3)
      const Q3 = Q2.mul(Q2).offset(P3.re, P3.im)
      console.log("Q3", Q3.toString())

      return [P1, P2, P3]
   }

   static calc_steps_big = (Q_big, P_big) => {

      let iteration = 1;

      const previously = {};

      let Z = new BigComplex(Q_big.re, Q_big.im);
      for (; iteration < 100; iteration++) {

         const position_slug = Z.toString(100);
         // console.log(position_slug)
         if (previously[position_slug] && iteration > 10) {
            return iteration - previously[position_slug];
         } else {
            previously[position_slug] = iteration;
         }

         const z0_test = Z.mul(Z).offset(P_big.re, P_big.im);

         if (math.isNaN(z0_test.re) || math.isNaN(z0_test.im)) {
            return -2
         }
         Z = new BigComplex(z0_test.re, z0_test.im);

      }
      return -1;
   }

   static calc_steps = (Q, P) => {

      let Z = Q;
      let z0_test = Q;

      let iteration = 1;
      let position_slug = `${Q.re},${Q.im}`;
      const previously = {position_slug: iteration};

      for (; iteration < 1000; iteration++) {
         z0_test = math.chain(Z).multiply(Z).add(P).valueOf();

         position_slug = `${z0_test.re},${z0_test.im}`;
         if (previously[position_slug] && iteration > 10) {
            return iteration - previously[position_slug];
         } else {
            previously[position_slug] = iteration;
         }

         Z = z0_test;
      }
      return -1;
   }

   static fast_calc = (seed_x0, seed_y0, test_iteration = 100) => {

      return FractoCalc.fast_calc_bignumber(seed_x0, seed_y0);

      // let x0_squared = seed_x0 * seed_x0;
      // let y0_squared = seed_y0 * seed_y0;
      //
      // const seed_r = Math.sqrt(x0_squared + y0_squared);
      // console.log("seed_r", seed_r.toString())
      //
      // const seed_theta = Math.atan2(seed_y0, seed_x0);
      // console.log("seed_theta", seed_theta.toString())
      //
      // const e_i_seed_theta = math.complex(0, seed_theta);
      // console.log("e_i_seed_theta", e_i_seed_theta.toString())
      //
      // const Q = math.chain(e_i_seed_theta).exp().multiply(seed_r).valueOf();
      // console.log("Q", Q.toString())
      //
      // const Q_squared = math.multiply(Q, Q);
      // console.log("Q_squared", Q_squared.toString())
      //
      // const P0 = math.chain(Q).subtract(Q_squared).valueOf();
      // console.log("P0", P0.toString())
      //
      // const calc_result00_no_seed = FractoCalc.calc(P0.re, P0.im, 1000000);
      // console.log("calc_result00_no_seed", calc_result00_no_seed)
      //
      // const calc_result00 = FractoCalc.calc(P0.re, P0.im, 1000000, seed_x0, seed_y0);
      // console.log("calc_result0", calc_result00)
      //
      // const orbital_0 = FractoCalc.calc_steps(Q, P0);
      // console.log("orbital_0", orbital_0)
      //
      //
      // const minus_Q_squared = math.chain(Q).multiply(Q).multiply(-1).valueOf();
      // console.log("minus_Q_squared", minus_Q_squared.toString())
      //
      // const P1 = math.chain(minus_Q_squared).subtract(Q).subtract(1).valueOf();
      // console.log("P1", P1.toString())
      //
      // const calc_result01_no_seed = FractoCalc.calc(P1.re, P1.im, 1000000);
      // console.log("calc_result01_no_seed", calc_result01_no_seed)
      //
      // const calc_result01 = FractoCalc.calc(P1.re, P1.im, 1000000, seed_x0, seed_y0);
      // console.log("calc_result01", calc_result01)
      //
      // const orbital_1 = FractoCalc.calc_steps(Q, P1);
      // console.log("orbital_1", orbital_1)
      //
      //
      // return {P0: P0, P1: P1}
   }

   render() {
      return <AppStyles.Block>
         <button onClick={e => this.process_cache()}>FractoCalc</button>
      </AppStyles.Block>
   }

}

export default FractoCalc;

