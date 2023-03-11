import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

// import {AppStyles} from "app/AppImports";

import FractoData from "../data/FractoData";
import FractoMruCache from "../data/FractoMruCache";
import FractoUtil from "../FractoUtil";

const FractoCanvas = styled.canvas`
   margin: 1rem;
`;

export class FractoRasterCanvas extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      aspect_ratio: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      level: PropTypes.number.isRequired,
   }

   static tile_cache = {};
   static cache_mru = {};

   state = {
      canvas_ref: React.createRef(),
      loading_tiles: true,
      highest_mru: 0
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
         return;
      }
      if (prevState.loading_tiles || this.state.loading_tiles) {
         return;
      }
      this.setState({loading_tiles: true})
      this.fill_canvas();
   }

   run_plan = (plan, all_tiles, ctx, cb) => {
      if (!plan.length) {
         cb(true);
         return;
      }
      const {x, y, img_x, img_y} = plan.shift();
      for (let i = 0; i < 4; i++) {
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
         FractoMruCache.get_tile_data(tile.short_code, point_data => {
            const tile_width = tile.bounds.right - tile.bounds.left
            const tile_x = Math.floor(255 * (x - tile.bounds.left) / tile_width);
            const tile_y = Math.floor(255 * (tile.bounds.top - y) / tile_width);
            const [pattern, iterations] = point_data[tile_x][tile_y];
            const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(pattern, iterations)
            ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
            ctx.fillRect(img_x, img_y, 1, 1);
            if (!img_y) {
               setTimeout(() => {
                  this.run_plan(plan, all_tiles, ctx, cb)
               }, 0)
            } else {
               this.run_plan(plan, all_tiles, ctx, cb)
            }
         })
         return;
      }
   }

   raster_canvas = (ctx) => {
      const {width_px, aspect_ratio, level, focal_point, scope} = this.props;

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

      let plan = new Array(width_px * height_px);
      let index = 0;
      for (let img_x = 0; img_x < width_px; img_x++) {
         const x = left_edge + img_x * increment;
         for (let img_y = 0; img_y < height_px; img_y++) {
            const y = top_edge - img_y * increment;
            plan[index++] = {x: x, y: y, img_x: img_x, img_y: img_y}
         }
      }

      console.log("all_shortcodes",all_shortcodes)
      FractoMruCache.get_tiles_async(all_shortcodes, result => {
         console.log("raster operation begins")
         this.run_plan(plan, all_tiles, ctx, on_complete => {
            console.log("raster operation complete")
            this.setState({loading_tiles: false})
         })
      })

   }

   fill_canvas = () => {
      const {canvas_ref} = this.state;
      const {width_px, aspect_ratio} = this.props;

      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, width_px, width_px * aspect_ratio);
      this.raster_canvas(ctx)
   }

   render() {
      const {canvas_ref, loading_tiles} = this.state;
      const {width_px, aspect_ratio} = this.props;
      const height_px = width_px * aspect_ratio;
      const canvas_style = {cursor: loading_tiles ? "wait" : "crosshair"}
      return <FractoCanvas
         ref={canvas_ref}
         style={canvas_style}
         width={width_px}
         height={height_px}
      />
   }
}

export default FractoRasterCanvas;
