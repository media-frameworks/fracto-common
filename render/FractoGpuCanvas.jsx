import React, {Component} from 'react';
import PropTypes from "prop-types";
import styled from "styled-components";

import {CoolStyles} from "../../../common/ui/CoolImports";

import FractoIndexedTiles from "../data/FractoIndexedTiles";
import FractoMruCache from "../data/FractoMruCache";
import FractoUtil from "../FractoUtil";
import {fill_canvas} from "./FractoLayeredImage";

const MAX_LEVEL = 35;

const gpu_canvas_buffer = (width_px, height_px, focal_point, scope, level_tiles, cb) => {
   const leftmost = focal_point.x - scope / 2
   const topmost = focal_point.y + scope / 2
   const canvas_increment = scope / width_px
   const kernel = gpu.createKernel((leftmost, topmost, canvas_increment) => {
      const x = leftmost + this.thread.x * canvas_increment
      const y = Math.abs(topmost - this.thread.y * canvas_increment)
      return this.thread.x;
   }).setOutput([width_px, height_px]);
   return kernel(leftmost, topmost, canvas_increment);
}

const get_tiles = (width_px, focal_point, scope, aspect_ratio, quality = 1) => {
   const all_tiles = []
   const height_px = width_px * aspect_ratio
   const tiles_on_edge_x = Math.ceil(width_px / 256) + quality;
   const tiles_on_edge_y = Math.ceil(height_px / 256) + quality;
   const max_tiles = Math.ceil(tiles_on_edge_x * tiles_on_edge_y)
   for (let level = 2; level < MAX_LEVEL; level++) {
      const level_tiles = FractoIndexedTiles.tiles_in_scope(
         level, focal_point, scope, aspect_ratio);
      all_tiles.push({
         level: level,
         level_tiles: level_tiles
      })
      if (short_codes.length > max_tiles) {
         break;
      }
   }
   return all_tiles.filter(tiles => tiles.level_tiles.length)
      .slice(-5)
      .sort((a, b) => a.level > b.level ? 1 : -1)
}

export class FractoGpuCanvas extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_plan_complete: PropTypes.func,
      aspect_ratio: PropTypes.number,
      disabled: PropTypes.bool.isRequired,
      update_counter: PropTypes.number.isRequired,
      filter_level: PropTypes.number.isRequired,
   }

   static defaultProps = {
      aspect_ratio: 1.0,
   }

   state = {
      canvas_buffer: null,
      canvas_ref: React.createRef(),
      loading_tiles: true,
   }

   componentDidMount() {
      const {canvas_ref} = this.state;
      const {width_px, aspect_ratio} = this.props;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      let height_px = Math.round(width_px * aspect_ratio);
      if (height_px & 1) {
         height_px -= 1
      }
      this.setState({
         height_px: height_px,
      })

      // ctx.fillStyle = FractoUtil.fracto_pattern_color_hsl(0, 10);
      // ctx.fillRect(0, 0, width_px, width_px);
      const canvas_buffer = this.init_canvas_buffer()
      this.fill_canvas_buffer(canvas_buffer, ctx)
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const width_px_changed = prevProps.width_px !== this.props.width_px;
      const aspect_ratio_changed = prevProps.aspect_ratio !== this.props.aspect_ratio;
      const focal_point_x_changed = prevProps.focal_point.x !== this.props.focal_point.x;
      const focal_point_y_changed = prevProps.focal_point.y !== this.props.focal_point.y;
      const scope_changed = prevProps.scope !== this.props.scope;
      const filter_level_changed = prevProps.filter_level !== this.props.filter_level;
      const update_counter_changed = prevProps.update_counter !== this.props.update_counter;
      let canvas_buffer = this.state.canvas_buffer
      // if (!focal_point_x_changed && !focal_point_y_changed && !scope_changed && !level_changed && !width_px_changed && !aspect_ratio_changed && canvas_buffer) {
      //    // console.log("no update")
      //    return;
      // }
      if (this.state.loading_tiles) {
         return;
      }
      if (
         width_px_changed
         || aspect_ratio_changed
         || !canvas_buffer) {
         canvas_buffer = this.init_canvas_buffer()
         this.fill_canvas_buffer(canvas_buffer, this.state.ctx);
      } else if (
         focal_point_x_changed
         || focal_point_y_changed
         || scope_changed
         || filter_level_changed
         || update_counter_changed) {
         this.fill_canvas_buffer(canvas_buffer, this.state.ctx);
      }
   }

   init_canvas_buffer = () => {
      const {canvas_buffer, ctx} = this.state
      if (canvas_buffer) {
         ctx.fillStyle = FractoUtil.fracto_pattern_color_hsl(0, 10)
         ctx.fillRect(0, 0, width_px, width_px);
         return (canvas_buffer)
      }
      const {width_px, aspect_ratio} = this.props
      if (width_px <= 0) {
         return;
      }
      let height_px = Math.round(width_px * aspect_ratio);
      if (height_px & 1) {
         height_px -= 1
      }
      const new_canvas_buffer = new Array(width_px).fill(0).map(() => new Array(height_px).fill([0, 4]));
      this.setState({
         canvas_buffer: new_canvas_buffer,
         height_px: height_px
      })
      return new_canvas_buffer
   }

   fill_canvas_buffer = (canvas_buffer, ctx) => {
      const {
         width_px,
         focal_point,
         scope,
         aspect_ratio,
         on_plan_complete,
         filter_level
      } = this.props
      let all_short_codes = []
      const all_level_sets = []
      get_tiles(width_px, focal_point, scope, aspect_ratio)
         .forEach(level_set => {
            const level_short_codes = level_set.level_tiles
               .map(tile => tile.short_code)
            all_short_codes = all_short_codes.concat(level_short_codes)
            all_level_sets.push(level_set)
         })
      if (!all_short_codes) {
         return;
      }
      this.setState({loading_tiles: true})
      FractoMruCache.get_tiles_async(all_short_codes, when_complete => {
         const level_data_sets = all_level_sets.map(level_set => {
            level_set.tile_data = {}
            level_set.level_tiles.forEach(tile => {
               level_set.tile_data[tile.short_code] = FractoMruCache.get_tile_data(tile.short_code)
            })
         })
         const canvas_buffer = gpu_canvas_buffer(
            width_px,
            width_px * aspect_ratio,
            focal_point,
            scope,
            all_level_sets, image_buffer => {
               this.setState({loading_tiles: false})
            });
      })
   }

   render() {
      const {canvas_ref, loading_tiles} = this.state;
      const {width_px, disabled, aspect_ratio} = this.props;
      const canvas_style = {
         cursor: loading_tiles || disabled ? "wait" : "crosshair"
      }
      return <FractoCanvas
         key={'fracto-canvas'}
         ref={canvas_ref}
         style={canvas_style}
         width={width_px}
         height={width_px * aspect_ratio}
      />
   }
}

export default FractoGpuCanvas
