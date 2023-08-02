import styled from "styled-components";

import network from "common/config/network.json";
import ComplexQuarternary from "common/math/ComplexQuarternary";

const EPSILON = 0.0000000001;
const ONE_BY_LOG_TEN_THOUSAND = 1 / Math.log(10000);
const ONE_BY_LOG_ONE_MILLION = 1 / Math.log(1000000);

const FRACTO_PHP_URL_BASE = network.dev_server_url;

export const DEFAULT_FRACTO_VALUES = {
   scope: 2.5,
   focal_point: {x: -.75, y: 0.771}
};

const HighlightBox = styled.div`
   position: fixed;
   border: 1px solid white;
   pointer-events: none;
`;

const SelectedTileBox = styled.div`
   position: fixed;
   border: 2px dashed white;
   pointer-events: none;
`;

const SelectedTileBoxOutline = styled.div`
   position: fixed;
   border: 2px dashed #888888;
   pointer-events: none;
`;

var COLOR_CACHE = {};
var CACHE_HITS = 0;
var CACHE_SIZE = 0;

setInterval(() => {
   console.log(`CACHE_HITS=${CACHE_HITS}, CACHE_SIZE=${CACHE_SIZE}`)
   if (CACHE_SIZE > 10000) {
      console.log("resetting COLOR_CACHE")
      COLOR_CACHE = {}
      CACHE_SIZE = 0
   }
}, 10000)

export class FractoUtil {

   static get_short_code = (long_code) => {
      return long_code
         .replaceAll('11', '3')
         .replaceAll('10', '2')
         .replaceAll('01', '1')
         .replaceAll('00', '0')
         .replaceAll('-', '')
   }

   static get_dirname_slug = (name) => {
      return name
         .toLowerCase()
         .trim()
         .replace(/[^\w\s-]/g, '')
         .replace(/[\s_-]+/g, '-')
         .replace(/^-+|-+$/g, '');
   }

   static fracto_pattern_family = (pattern) => {
      if (pattern < 2) {
         return pattern;
      }
      let result = pattern;
      while (result % 2 === 0) {
         result /= 2;
      }
      return result;
   }

   static fracto_relative_harmonic = (root, pattern) => {
      const ratio = pattern / root;
      return Math.abs(Math.round(ratio) - ratio) < EPSILON ? ratio : 0;
   }

   static fracto_pattern_octave = (pattern) => {
      let octave = 0;
      let reduction = pattern;
      while (reduction % 2 === 0) {
         reduction = Math.round(reduction / 2);
         octave++;
      }
      return octave;
   }

   static fracto_designation = (root, pattern, short_form = false) => {
      let relative_harmonic = FractoUtil.fracto_relative_harmonic(root, pattern);
      if (0 === relative_harmonic) {
         return short_form ? "h0" : "non-harmonic"
      }
      const pattern_octave = FractoUtil.fracto_pattern_octave(relative_harmonic);
      if (0 === pattern_octave) {
         if (1 === relative_harmonic) {
            return short_form ? `r${root}` : `root ${root}`
         }
         return short_form ? `r${root},h${relative_harmonic}` : `root ${root} harmonic ${relative_harmonic}`;
      }
      for (let i = 0; i < pattern_octave; i++) {
         relative_harmonic = Math.round(relative_harmonic / 2);
      }
      if (relative_harmonic === 1) {
         if (1 === pattern_octave) {
            return short_form ? `r${root},o1` : `root ${root} octave 1`
         }
         return short_form ? `r${root},o${pattern_octave}` : `root ${root} octave ${pattern_octave}`;
      }
      return short_form ? `r${root},h${relative_harmonic},o${pattern_octave}` : `root ${root} harmonic ${relative_harmonic} octave ${pattern_octave}`;
   }

   static fracto_pattern_color_hsl = (pattern, iterations = 255) => {
      if (pattern === -1) {
         return [0, 0, 0]
      }
      const cache_key = `(${pattern},${iterations})`;
      if (COLOR_CACHE[cache_key]) {
         CACHE_HITS++;
         return COLOR_CACHE[cache_key];
      }
      if (pattern === 0) {
         let offset = Math.log(iterations) * ONE_BY_LOG_TEN_THOUSAND;
         if (iterations < 21) {
            offset *= 0.9;
         }
         const lum = 1.0 - offset;
         const lum_pct = Math.round(100 * lum)
         COLOR_CACHE[cache_key] = [0, 0, lum_pct];
         CACHE_SIZE++;
         return COLOR_CACHE[cache_key];
      }

      const log2 = Math.log2(pattern);
      const hue = pattern ? 360 * (log2 - Math.floor(log2)) : 0;
      const lum = 0.15 + 0.75 * Math.log(iterations) * ONE_BY_LOG_ONE_MILLION;

      const lum_pct = Math.round(100 * lum)
      COLOR_CACHE[cache_key] = [Math.round(hue), 75, lum_pct];
      CACHE_SIZE++;
      return COLOR_CACHE[cache_key];
   }

   static fracto_pattern_color = (pattern, iterations = 255) => {
      const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(pattern, iterations);
      return `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
   }

   dataURItoBlob = (dataURI) => {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for (var i = 0; i < binary.length; i++) {
         array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
   }

   static canvas_to_blob = (canvas_ref, type = "image/png") => {
      const canvas = canvas_ref.current;
      if (!canvas) {
         return null;
      }
      const dataUrl = canvas.toDataURL(type);
      const binary = atob(dataUrl.split(',')[1]);
      let array = [];
      for (var i = 0; i < binary.length; i++) {
         array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: type});
   }

   static data_to_canvas = (tile_points, ctx, width_px) => {
      if (!ctx || !tile_points) {
         return;
      }
      // ctx.fillStyle = 'white';
      // ctx.fillRect(0, 0, width_px, width_px);
      const scale_factor = width_px / 256;
      const pixel_size = 1.375 * scale_factor
      for (let img_x = 0; img_x < 256; img_x++) {
         const y_values = tile_points[img_x];
         if (!y_values) {
            return;
         }
         for (let img_y = 0; img_y < 256; img_y++) {
            const data_values = y_values[img_y];
            ctx.fillStyle = FractoUtil.fracto_pattern_color(data_values[0], data_values[1])
            ctx.fillRect(img_x * scale_factor, img_y * scale_factor, pixel_size, pixel_size);
         }
      }
   }

   static get_pattern_lists = (data) => {

      let all_patterns = {};
      for (let img_x = 0; img_x < data.length; img_x++) {
         const column = data[img_x];
         for (let img_y = 0; img_y < column.length; img_y++) {
            const pixel = column[img_y];
            const pattern = pixel[0];
            const pattern_key = `_${pattern}`;
            if (!all_patterns[pattern_key]) {
               all_patterns[pattern_key] = 1;
            } else {
               all_patterns[pattern_key] += 1;
            }
         }
      }

      let all_families = {}
      Object.keys(all_patterns).forEach(pattern_key => {
         const pattern = parseInt(pattern_key.replace('_', ''));
         const family = FractoUtil.fracto_pattern_family(pattern)
         const family_key = `_${family}`;
         if (!all_families[family_key]) {
            all_families[family_key] = [];
         }
         all_families[family_key].push({
            pattern: pattern,
            amount: all_patterns[pattern_key]
         })
      });

      const total_size = data.length * data.length;
      return Object.keys(all_families).map(key => {
         const family = parseInt(key.replace('_', ''));
         let total_amount = 0;
         const pattern_list = all_families[key].map(member => {
            total_amount += member.amount;
            return member.pattern;
         }).sort((a, b) => a - b);
         return {
            family: family,
            total_amount: total_amount,
            total_amount_pct: Math.floor(100000 * total_amount / total_size) / 1000.0,
            color: FractoUtil.fracto_pattern_color(family),
            all_patterns: pattern_list,
            members: all_families[key].sort((a, b) => a.pattern - b.pattern),
         }
      }).sort((a, b) => a.family - b.family)
   }

   static highlight_points = (image_ref, fracto_values, point_highlights) => {
      if (!image_ref.current || !point_highlights.length) {
         return [];
      }

      const aspect_ratio = 1.0
      const image_bounds = image_ref.current.getBoundingClientRect();
      const scope_x_by_2 = fracto_values.scope / 2;
      const scope_y_by_2 = aspect_ratio * scope_x_by_2;
      const leftmost = fracto_values.focal_point.x - scope_x_by_2;
      const topmost = fracto_values.focal_point.y + scope_y_by_2;

      return point_highlights.map(point_highlight => {

         if (point_highlight.x < leftmost || point_highlight.x > leftmost + fracto_values.scope) {
            return [];
         }
         if (point_highlight.y > topmost || point_highlight.y < topmost - fracto_values.scope * aspect_ratio) {
            return [];
         }
         const img_x = image_bounds.width * (point_highlight.x - leftmost) / fracto_values.scope - 1
         const img_y = image_bounds.width * (topmost - point_highlight.y) / (fracto_values.scope * aspect_ratio) - 1

         const highlight_outline_1 = {
            left: image_bounds.left + img_x - 5,
            top: image_bounds.top + img_y - 5,
            width: 10,
            height: 10,
         }
         const highlight_outline_2 = {
            left: image_bounds.left + img_x - 10,
            top: image_bounds.top + img_y - 10,
            width: 20,
            height: 20,
         }
         const highlight_outline_3 = {
            left: image_bounds.left + img_x - 15,
            top: image_bounds.top + img_y - 15,
            width: 30,
            height: 30,
         }
         return [
            <HighlightBox style={highlight_outline_1}/>,
            <HighlightBox style={highlight_outline_2}/>,
            <HighlightBox style={highlight_outline_3}/>,
         ]
      })
   }

   static render_tile_outline = (wrapper_ref, bounds, focal_point, scope, width_px) => {
      const pixel_width = scope / width_px;
      const half_width_px = width_px / 2;
      const half_height_px = width_px / 2;
      const box_left = half_width_px - (focal_point.x - bounds.left) / pixel_width;
      const box_right = half_width_px - (focal_point.x - bounds.right) / pixel_width;
      const box_top = half_height_px - (bounds.top - focal_point.y) / pixel_width;
      const box_bottom = half_height_px - (bounds.bottom - focal_point.y) / pixel_width;
      const wrapper_bounds = wrapper_ref.current.getBoundingClientRect();
      const white_border = {
         left: `${box_left + wrapper_bounds.left}px`,
         top: `${box_top + wrapper_bounds.top}px`,
         width: `${box_right - box_left}px`,
         height: `${box_bottom - box_top}px`
      };
      const black_border = {
         left: `${box_left + wrapper_bounds.left - 2}px`,
         top: `${box_top + wrapper_bounds.top - 2}px`,
         width: `${box_right - box_left + 4}px`,
         height: `${box_bottom - box_top + 4}px`
      };
      return [
         <SelectedTileBoxOutline key={"outline-1"} style={black_border}/>,
         <SelectedTileBox key={"outline-2"} style={white_border}/>
      ]
   }

   static bounds_from_short_code = (short_code) => {
      let left = -2;
      let right = 2;
      let top = 2;
      let bottom = -2;
      let scope = 4.0;
      for (let i = 0; i < short_code.length; i++) {
         const half_scope = scope / 2;
         const digit = short_code[i];
         switch (digit) {
            case "0":
               right -= half_scope;
               bottom += half_scope;
               break;
            case "1":
               left += half_scope;
               bottom += half_scope;
               break;
            case "2":
               right -= half_scope;
               top -= half_scope;
               break;
            case "3":
               left += half_scope;
               top -= half_scope;
               break;
            default:
               debugger;
         }
         scope = half_scope;
      }
      return {
         left: left,
         right: right,
         top: top,
         bottom: bottom
      }
   }

   static tile_to_bin = (short_code, from, to, cb) => {
      const url = `${FRACTO_PHP_URL_BASE}/tile_to_bin.php?from=${from}&to=${to}&short_code=${short_code}`;
      fetch(url)
         .then(response => response.json())
         .then(result => {
            cb(result)
         })
   }

   static empty_tile = (short_code, cb) => {
      const url = `${FRACTO_PHP_URL_BASE}/empty_tile.php?short_code=${short_code}&confirmed=CONFIRMED`;
      fetch(url)
         .then(response => response.json())
         .then(result => {
            cb(result)
         })
   }

   static CQ_code_from_point = (x, y) => {
      const CQ_str = new ComplexQuarternary(x, y).to_string()
      const cq_code = CQ_str.replace(/^0+/, '')
      if (cq_code[0] === '.') {
         return `0${cq_code}`
      }
      return cq_code
   }

   static bailiwick_name = (pattern, core_point, best_level) => {
      const cq_code = FractoUtil.CQ_code_from_point(core_point.x, core_point.y)
      return `B${pattern}-CP${cq_code.slice(0, best_level)}`
   }

   static parseFloatWithRadix = (s, r) => {
      r = (r || 10) | 0;
      const [b, a] = ((s || '0') + '.').split('.');
      const l1 = parseInt('1' + (a || ''), r).toString(r).length;
      return parseInt(b, r) +
         parseInt(a || '0', r) / parseInt('1' + Array(l1).join('0'), r);
   }
}

export default FractoUtil;
