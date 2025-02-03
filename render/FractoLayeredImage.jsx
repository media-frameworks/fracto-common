import React, {Component} from 'react';
import PropTypes from "prop-types";
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

import FractoIndexedTiles from "../data/FractoIndexedTiles";
import FractoMruCache from "../data/FractoMruCache";
import FractoUtil from "../FractoUtil";
import FractoTileCache from "../data/FractoTileCache";

const MAX_LEVEL = 35

const FractoCanvas = styled.canvas`   
   ${CoolStyles.narrow_box_shadow}
   margin: 0;
`;

const get_tiles = (width_px, focal_point, scope, aspect_ratio, quality = 1) => {
   const all_tiles = []
   const tiles_on_edge = Math.ceil(width_px / 256) + quality;
   const max_tiles = Math.ceil(tiles_on_edge * tiles_on_edge)
   for (let level = 2; level < MAX_LEVEL; level++) {
      const level_tiles = FractoIndexedTiles.tiles_in_scope(
         level, focal_point, scope, aspect_ratio);
      all_tiles.push({
         level: level,
         level_tiles: level_tiles
      })
      if (level_tiles.length > max_tiles) {
         break;
      }
   }
   return all_tiles.filter(tiles => tiles.level_tiles.length).slice(-3)
}

const apply_large_pixels = (tile, tile_data, ctx, pixel_size, width_px, focal_point, scope, aspect_ratio, canvas_buffer) => {
   const leftmost = focal_point.x - scope / 2
   const rightmost = focal_point.x + scope / 2
   const topmost = focal_point.y + scope / 2
   let bottommost = focal_point.y - scope / 2
   const increment = (tile.bounds.right - tile.bounds.left) / 256
   for (let tile_x = 0; tile_x < 256; tile_x++) {
      const x = tile.bounds.left + tile_x * increment
      if (x < leftmost) {
         continue
      }
      if (x > rightmost) {
         continue
      }
      const canvas_x = width_px * (x - leftmost) / scope
      for (let tile_y = 0; tile_y < 256; tile_y++) {
         const y = tile.bounds.top - tile_y * increment
         if (y > topmost) {
            continue
         }
         if (y < bottommost) {
            continue
         }
         const canvas_y = width_px * (topmost - y) / scope
         const pattern = tile_data[tile_x][tile_y][0]
         const iteration = tile_data[tile_x][tile_y][1]
         const x_index = Math.floor(canvas_x)
         const y_index = Math.floor(canvas_y)
         if (canvas_buffer[x_index] && canvas_buffer[x_index][y_index]) {
            canvas_buffer[Math.floor(canvas_x)][Math.floor(canvas_y)] = [pattern, iteration];
         }
         const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(pattern, iteration)
         ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
         ctx.fillRect(canvas_x, canvas_y, pixel_size, pixel_size);
         if (bottommost < 0) {
            const neg_canvas_y = (width_px / scope) * (topmost + y);
            ctx.fillRect(canvas_x, neg_canvas_y - 1, pixel_size, pixel_size);
         }
      }
   }
}

const apply_per_pixel = (tile, tile_data, ctx, width_px, focal_point, scope, aspect_ratio, canvas_buffer) => {
   const leftmost = focal_point.x - scope / 2
   const topmost = focal_point.y + scope / 2
   const canvas_increment = scope / width_px
   const tile_width = tile.bounds.right - tile.bounds.left
   const tile_increment = tile_width / 256
   if (!tile_data || !Array.isArray(tile_data[0])) {
      return;
   }
   for (let canvas_x = 0; canvas_x < width_px; canvas_x++) {
      const x = leftmost + canvas_x * canvas_increment
      if (x < tile.bounds.left) {
         continue
      }
      if (x > tile.bounds.right) {
         break
      }
      const tile_x = Math.floor((x - tile.bounds.left) / tile_increment)
      for (let canvas_y = 0; canvas_y < width_px; canvas_y++) {
         const y = Math.abs(topmost - canvas_y * canvas_increment)
         if (y > tile.bounds.top) {
            continue
         }
         if (y < tile.bounds.bottom) {
            continue
         }
         const tile_y = Math.floor((tile.bounds.top - y) / tile_increment)
         if (Array.isArray(tile_data[tile_x]) && Array.isArray(tile_data[tile_x][tile_y])) {
            const pattern = tile_data[tile_x][tile_y][0]
            const iteration = tile_data[tile_x][tile_y][1]
            if (canvas_buffer[canvas_x] && canvas_buffer[canvas_x][canvas_y]) {
               canvas_buffer[canvas_x][canvas_y] = [pattern, iteration];
            }
            const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(pattern, iteration)
            ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
            ctx.fillRect(canvas_x, canvas_y, 1, 1);
         }
      }
   }
   // apply_large_pixels(tile, tile_data, ctx, 1, width_px, focal_point, scope, aspect_ratio, canvas_buffer)
}

const apply_tile_data = (tile, tile_data, ctx, width_px, focal_point, scope, aspect_ratio, canvas_buffer) => {
   if (!tile_data) {
      return;
   }
   const tile_width = tile.bounds.right - tile.bounds.left
   const pixel_size = Math.ceil((width_px * tile_width) / (256 * scope))
   if (pixel_size > 1.0) {
      apply_large_pixels(tile, tile_data, ctx, pixel_size, width_px, focal_point, scope, aspect_ratio, canvas_buffer)
   } else {
      apply_per_pixel(tile, tile_data, ctx, width_px, focal_point, scope, aspect_ratio, canvas_buffer)
   }
}

export const fill_canvas = (ctx, width_px, focal_point, scope, aspect_ratio, canvas_buffer, filter_level) => {
   const tiles_in_scope = get_tiles(width_px, focal_point, scope, aspect_ratio)
   const tiles = []
   tiles_in_scope.forEach(tile_set => {
      if (filter_level && tile_set.level !== filter_level) {
         return;
      }
      tile_set.level_tiles.forEach(tile => {
         tiles.push(tile)
      })
   })
   console.log('tiles', tiles)
   console.log('tiles_in_scope', tiles_in_scope)
   const short_codes = tiles.map(tile => tile.short_code)
   FractoMruCache.get_tiles_async(short_codes, async when_complete => {
      for (let i = 0; i < short_codes.length; i++) {
         const short_code = short_codes[i]
         // console.log('short_code', short_code)
         const tile = tiles.find(tile => tile.short_code === short_code)
         const tile_data = await FractoTileCache.get_tile(tile.short_code)
         // const tile_data = FractoMruCache.get_tile_data(short_code)
         apply_tile_data(tile, tile_data, ctx, width_px, focal_point, scope, aspect_ratio, canvas_buffer)
      }
   })
}

export class FractoLayeredImage extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_plan_complete: PropTypes.func,
      aspect_ratio: PropTypes.number,
      disabled: PropTypes.bool,
      update_counter: PropTypes.number,
      filter_level: PropTypes.number,
   }

   static defaultProps = {
      aspect_ratio: 1.0,
      disabled: false,
      update_counter: 1,
   }

   state = {
      ctx: null,
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
      const ctx = canvas.getContext('2d');
      let height_px = Math.round(width_px * aspect_ratio);
      if (height_px & 1) {
         height_px -= 1
      }
      this.setState({
         height_px: height_px,
         ctx: ctx
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
      const level_changed = prevProps.level !== this.props.level;
      const update_counter_changed = prevProps.update_counter !== this.props.update_counter;
      let canvas_buffer = this.state.canvas_buffer
      // if (!focal_point_x_changed && !focal_point_y_changed && !scope_changed && !level_changed && !width_px_changed && !aspect_ratio_changed && canvas_buffer) {
      //    // console.log("no update")
      //    return;
      // }
      if (this.state.loading_tiles) {
         return;
      }
      if (width_px_changed || aspect_ratio_changed || !canvas_buffer) {
         canvas_buffer = this.init_canvas_buffer()
         this.fill_canvas_buffer(canvas_buffer, this.state.ctx);
      } else if (focal_point_x_changed || focal_point_y_changed || scope_changed || level_changed || update_counter_changed) {
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
      const {width_px, focal_point, scope, aspect_ratio, on_plan_complete, filter_level} = this.props
      this.setState({loading_tiles: true})
      setTimeout(() => {
         fill_canvas(ctx, width_px, focal_point, scope, aspect_ratio, canvas_buffer, filter_level)
         if (on_plan_complete) {
            on_plan_complete(canvas_buffer, ctx)
         }
         setTimeout(() => {
            this.setState({loading_tiles: false})
         }, 20)
      }, 20)
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