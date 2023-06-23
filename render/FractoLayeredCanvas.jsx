import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import FractoData, {HIGH_QUALITY} from "../data/FractoData";
import FractoUtil from "../FractoUtil";
import FractoMruCache from "../data/FractoMruCache"
import {CoolStyles} from "../../../common/ui/CoolImports";

const FractoCanvas = styled.canvas`
   margin: 0;
`;

const LQ_PLAN = [
   {level_adjust: -2, layer_opacity: 80},
   {level_adjust: -1, layer_opacity: 100},
]

const REGULAR_PLAN = [
   {level_adjust: -2, layer_opacity: 60},
   {level_adjust: -1, layer_opacity: 80},
   {level_adjust: 0, layer_opacity: 100},
]

const HQ_PLAN = [
   {level_adjust: -4, layer_opacity: 100},
   {level_adjust: -3, layer_opacity: 100},
   {level_adjust: -2, layer_opacity: 100},
   {level_adjust: -1, layer_opacity: 100},
   {level_adjust: 0, layer_opacity: 100},
]

export const QUALITY_HIGH = "quality_high"
export const QUALITY_MEDIUM = "quality_medium"
export const QUALITY_LOW = "quality_low"

export class FractoLayeredCanvas extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      aspect_ratio: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      level: PropTypes.number.isRequired,
      quality: PropTypes.string,
      save_filename: PropTypes.string,
      on_plan_complete: PropTypes.func,
      on_progress: PropTypes.func,
      highlight_points: PropTypes.array
   }

   static defaultProps = {
      high_quality: false,
      quality: QUALITY_MEDIUM,
      highlight_points: []
   }

   state = {
      canvas_ref: React.createRef(),
      plan_step: -1,
      progress_pct: -1
   };

   componentDidMount() {
      setInterval(() => {
         this.forceUpdate()
         if (!this.props.on_progress) {
            return;
         }
         this.props.on_progress(this.state.progress_pct)
      }, 500)
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
      this.fill_canvas();
   }

   fill_tile = (canvas_bounds, tile_bounds, point_data, bg_factor, ctx) => {
      const {width_px, aspect_ratio, scope} = this.props;
      if (!point_data) {
         console.log("point_data error", point_data)
         return;
      }
      const height_px = width_px * aspect_ratio;
      const canvas_width = canvas_bounds.right - canvas_bounds.left;
      const canvas_height = canvas_width * aspect_ratio;
      const HEIGHT_PX_BY_CANVAS_HEIGHT = height_px / canvas_height;
      const WIDTH_PX_BY_CANVAS_WIDTH = width_px / canvas_width;

      const tile_span = tile_bounds.right - tile_bounds.left
      const tile_pixel_size = tile_span / 256;
      const canvas_pixel_size = (1.5 * bg_factor / 100) * (width_px * tile_span) / (256 * scope)

      for (let tile_x = 0; tile_x < 256; tile_x++) {
         const left = tile_bounds.left + tile_x * tile_pixel_size;
         const right = left + tile_pixel_size;
         if (right < canvas_bounds.left || left > canvas_bounds.right) {
            continue;
         }
         const canvas_x = WIDTH_PX_BY_CANVAS_WIDTH * (left - canvas_bounds.left);
         for (let tile_y = 0; tile_y < 256; tile_y++) {
            const top = tile_bounds.top - tile_y * tile_pixel_size;
            const bottom = top - tile_pixel_size;
            if (bottom > canvas_bounds.top || top < canvas_bounds.bottom) {
               continue;
            }
            const canvas_y = HEIGHT_PX_BY_CANVAS_HEIGHT * (canvas_bounds.top - top);
            if (Array.isArray(point_data[tile_x]) && Array.isArray(point_data[tile_x][tile_y])) {
               const [pattern, iterations] = point_data[tile_x][tile_y];
               const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(pattern, iterations)
               ctx.fillStyle = `hsla(${hue}, ${sat_pct}%, ${lum_pct}%, ${bg_factor}%)`
               ctx.fillRect(canvas_x, canvas_y, canvas_pixel_size, canvas_pixel_size);
               if (canvas_bounds.bottom < 0) {
                  const neg_canvas_y = HEIGHT_PX_BY_CANVAS_HEIGHT * (canvas_bounds.top + top);
                  ctx.fillRect(canvas_x, neg_canvas_y - 1, canvas_pixel_size, canvas_pixel_size);
               }
            } else {
               console.error("point_data is broken (point_data, tile_x, tile_y)", point_data, tile_x, tile_y);
            }
         }
      }

   }

   fill_layer = (level, canvas_bounds, bg_factor, ctx, cb) => {
      const {plan_step} = this.state
      const {focal_point, scope, aspect_ratio} = this.props;
      if (level < 2) {
         console.log("invalid level", level)
         cb(true);
         return;
      }
      const tiles = FractoData.tiles_in_scope(level, focal_point, scope, aspect_ratio)
      if (tiles.length > 1000) {
         console.log("too many tiles", tiles.length)
         cb(true);
         return;
      }
      if (!tiles.length) {
         console.log("no tiles", tiles.length)
         cb(true);
         return;
      }
      for (let tile_index = 0; tile_index < tiles.length; tile_index++) {
         const tile = tiles[tile_index];
         const short_code = tile.short_code;
         const tile_data = FractoMruCache.tile_cache[short_code];
         this.fill_tile(canvas_bounds, tile.bounds, tile_data, bg_factor, ctx);
         const progress_pct = plan_step * 25 + tile_index * 25 / tiles.length
         this.setState({progress_pct: progress_pct})
      }
      cb(true)
   }

   run_plan = (plan, canvas_bounds, ctx) => {
      const {plan_step, canvas_ref} = this.state
      const {aspect_ratio, level, focal_point, scope, on_plan_complete} = this.props;
      const step = plan.shift();
      const adjusted_level = level + step.level_adjust;
      if (adjusted_level < 2) {
         if (plan.length) {
            this.run_plan(plan, canvas_bounds, ctx)
         } else {
            console.log("plan complete")
            this.setState({progress_pct: -1})
            if (on_plan_complete) {
               on_plan_complete(canvas_ref)
            }
         }
         return;
      }
      const adjusted_level_tiles = FractoData.tiles_in_scope(adjusted_level, focal_point, scope, aspect_ratio)
      const short_codes = adjusted_level_tiles.map(tile => tile.short_code)
      FractoMruCache.get_tiles_async(short_codes, get_result => {
         this.fill_layer(adjusted_level, canvas_bounds, step.layer_opacity, ctx, result => {
            if (!result) {
               console.log("failed filling layer", adjusted_level)
               return;
            }
            if (plan.length) {
               this.setState({plan_step: plan_step + 1})
               this.run_plan(plan, canvas_bounds, ctx)
            } else {
               console.log("plan complete")
               this.setState({progress_pct: -1})
               if (on_plan_complete) {
                  on_plan_complete(canvas_ref)
               }
            }
         })
      })
   }

   fill_canvas = () => {
      const {canvas_ref, progress_pct} = this.state;
      const {width_px, aspect_ratio, focal_point, scope, quality} = this.props;
      const height_px = width_px * aspect_ratio;
      if (progress_pct >= 0) {
         console.log('in progress, must wait...');
         return;
      }
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = `white`
      ctx.fillRect(0, 0, width_px, height_px);

      const half_width = scope / 2;
      const half_height = (aspect_ratio * scope) / 2;
      const canvas_bounds = {
         left: focal_point.x - half_width,
         right: focal_point.x + half_width,
         top: focal_point.y + half_height,
         bottom: focal_point.y - half_height,
      }

      let plan = REGULAR_PLAN
      switch (quality) {
         case QUALITY_HIGH:
            plan = HQ_PLAN;
            break;
         case QUALITY_LOW:
            plan = LQ_PLAN;
            break;
         case QUALITY_MEDIUM:
         default:
            break;
      }
      const plan_copy = plan.map(step => Object.assign({}, step))
      this.setState({
         plan_step: 0,
         progress_pct: 0
      })
      this.run_plan(plan_copy, canvas_bounds, ctx)
   }

   save_png = () => {
      const {canvas_ref} = this.state;
      const {save_filename} = this.props;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      if (!save_filename) {
         console.log('no save_filename');
         return;
      }
      var url = canvas.toDataURL("image/png");
      var link = document.createElement('a');
      link.download = `${save_filename}.png`;
      link.href = url;
      link.click();
   }

   render() {
      const {canvas_ref, progress_pct} = this.state;
      const {width_px, aspect_ratio, highlight_points, scope, focal_point, on_progress} = this.props;
      const height_px = width_px * aspect_ratio;
      let highlights = ''
      if (highlight_points.length) {
         const fracto_values = {scope: scope, focal_point: focal_point}
         highlights = FractoUtil.highlight_points(canvas_ref, fracto_values, highlight_points)
      }
      const pct = on_progress || progress_pct < 0 ? '' : `${Math.round(progress_pct * 100) / 100}%`
      return [
         <FractoCanvas
            key={`canvas`}
            onClick={e => this.save_png()}
            ref={canvas_ref}
            width={width_px}
            height={height_px}
         />,
         highlights,
         <CoolStyles.Block key={"percent"}>{pct}</CoolStyles.Block>
      ]
   }
}

export default FractoLayeredCanvas;
