import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

import FractoData from "../data/FractoData";
import FractoMruCache, {TILE_CACHE} from "../data/FractoMruCache";
import FractoUtil from "../FractoUtil";

const FractoCanvas = styled.canvas`   
   ${CoolStyles.narrow_box_shadow}
   margin: 0;
`;

export class FractoRasterCanvas extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      level: PropTypes.number.isRequired,
      aspect_ratio: PropTypes.number,
      on_plan_complete: PropTypes.func,
      highlight_points: PropTypes.array
   }

   static tile_cache = {};
   static cache_mru = {};

   static defaultProps = {
      highlight_points: [],
      aspect_ratio: 1.0
   }

   state = {
      canvas_ref: React.createRef(),
      loading_tiles: true,
      highest_mru: 0,
      local_cache: {}
   };

   componentDidMount() {
      this.fill_canvas()
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const focal_point_x_changed = prevProps.focal_point.x !== this.props.focal_point.x;
      const focal_point_y_changed = prevProps.focal_point.y !== this.props.focal_point.y;
      const scope_changed = prevProps.scope !== this.props.scope;
      const level_changed = prevProps.level !== this.props.level;
      if (!focal_point_x_changed && !focal_point_y_changed && !scope_changed && !level_changed) {
         // console.log("no update")
         return;
      }
      if (this.state.loading_tiles) {
         return;
      }
      this.setState({loading_tiles: true})
      this.fill_canvas();
   }

   run_plan = (plan, all_tiles, ctx, cb) => {
      const {local_cache} = this.state
      const {width_px, aspect_ratio} = this.props;
      if (!plan.length) {
         cb(true);
         return;
      }
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, width_px, width_px * aspect_ratio);
      for (let point_index = 0; point_index < plan.length; point_index++) {
         const x = plan[point_index].x
         const y = plan[point_index].y
         const img_x = plan[point_index].img_x
         const img_y = plan[point_index].img_y

         // if (point_index % 10000 === 0) {
         //    console.log(`${point_index} of ${plan.length}`)
         // }
         let completed = false
         for (let i = 0; i < all_tiles.length && !completed; i++) {
            if (!all_tiles[i].length) {
               continue;
            }
            const tile_width = all_tiles[i][0].bounds.right - all_tiles[i][0].bounds.left
            const one_by_tile_width = 1 / tile_width
            const tile = all_tiles[i].find(tile => {
               if (tile.bounds.right < x) {
                  return false;
               }
               if (tile.bounds.left > x) {
                  return false;
               }
               if (tile.bounds.top < y) {
                  return false;
               }
               if (tile.bounds.bottom > y) {
                  return false;
               }
               return true;
            });
            if (!tile) {
               continue;
            }
            if (!local_cache[tile.short_code]) {
               local_cache[tile.short_code] = JSON.parse(TILE_CACHE[tile.short_code])
               // console.log("local_cache[tile.short_code]", tile.short_code, local_cache[tile.short_code])
            }
            const point_data = local_cache[tile.short_code]
            const tile_x = Math.floor(255 * (x - tile.bounds.left) * one_by_tile_width);
            const tile_y = Math.floor(255 * (tile.bounds.top - y) * one_by_tile_width);
            const [pattern, iterations] = point_data[tile_x][tile_y];
            const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(pattern, iterations)
            ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
            ctx.fillRect(img_x, img_y, 1, 1);
            completed = true;
         }
      }
      cb(true)
   }

   raster_canvas = (ctx) => {
      const {width_px, aspect_ratio, level, focal_point, scope, on_plan_complete} = this.props;
      console.log("raster_canvas")

      const all_tiles = new Array(4).fill([])
      all_tiles[0] = FractoData.tiles_in_scope(level, focal_point, scope, aspect_ratio);
      all_tiles[1] = FractoData.tiles_in_scope(level - 1, focal_point, scope, aspect_ratio);
      all_tiles[2] = FractoData.tiles_in_scope(level - 2, focal_point, scope, aspect_ratio);
      all_tiles[3] = FractoData.tiles_in_scope(level - 3, focal_point, scope, aspect_ratio);

      const all_shortcodes =
         all_tiles[0].map(tile => tile.short_code)
            .concat(all_tiles[1].map(tile => tile.short_code))
            .concat(all_tiles[2].map(tile => tile.short_code))
            .concat(all_tiles[3].map(tile => tile.short_code))

      const left_edge = focal_point.x - scope / 2;
      const top_edge = focal_point.y + aspect_ratio * scope / 2;
      const increment = scope / width_px;
      const height_px = width_px * aspect_ratio;

      console.log("width_px, height_px", width_px, height_px)
      let plan = new Array(width_px * height_px);
      let index = 0;
      for (let img_x = 0; img_x < width_px; img_x++) {
         const x = left_edge + img_x * increment;
         for (let img_y = 0; img_y < height_px; img_y++) {
            const y = top_edge - img_y * increment;
            plan[index++] = {x: x, y: Math.abs(y), img_x: img_x, img_y: img_y}
         }
      }

      console.log("all_shortcodes", all_shortcodes)
      FractoMruCache.get_tiles_async(all_shortcodes, result => {
         console.log("raster operation begins")
         this.run_plan(plan, all_tiles, ctx, on_complete => {
            console.log("raster operation complete")
            this.setState({loading_tiles: false})
            on_plan_complete(on_complete)
         })
      })

   }

   fill_canvas = () => {
      const {canvas_ref} = this.state;

      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      this.raster_canvas(ctx)
   }

   render() {
      const {canvas_ref, loading_tiles} = this.state;
      const {width_px, aspect_ratio, highlight_points, scope, focal_point} = this.props;
      const height_px = width_px * aspect_ratio;
      const canvas_style = {cursor: loading_tiles ? "wait" : "crosshair"}
      let highlights = ''
      if (highlight_points.length && !loading_tiles) {
         const fracto_values = {scope: scope, focal_point: focal_point}
         highlights = FractoUtil.highlight_points(canvas_ref, fracto_values, highlight_points)
      }
      return [
         <FractoCanvas
            ref={canvas_ref}
            style={canvas_style}
            width={width_px}
            height={height_px}
         />,
         highlights
      ]
   }
}

export default FractoRasterCanvas;
