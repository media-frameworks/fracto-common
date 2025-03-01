import React, {Component} from 'react';
import PropTypes from "prop-types";
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

import FractoIndexedTiles from "fracto/common/data/FractoIndexedTiles";
import FractoUtil from "fracto/common/FractoUtil";
import FractoFastCalc from "fracto/common/data/FractoFastCalc";
import FractoTileCache from "fracto/common/data/FractoTileCache";

const FractoCanvas = styled.canvas`
    ${CoolStyles.narrow_box_shadow}
    margin: 0;
`;

const MAX_LEVEL = 35;
export var BAD_TILES = {};

export const get_tiles = (
   width_px,
   focal_point,
   scope,
   aspect_ratio,
   list_all = false) => {

   const all_tiles = []
   const height_px = width_px * aspect_ratio
   const tiles_on_edge_x = Math.ceil(width_px / 256) + 1;
   const tiles_on_edge_y = Math.ceil(height_px / 256) + 1;
   const max_tiles = Math.ceil(tiles_on_edge_x * tiles_on_edge_y + 1)
   for (let level = 2; level < MAX_LEVEL; level++) {
      const level_tiles = FractoIndexedTiles.tiles_in_scope(
         level, focal_point, scope, aspect_ratio);
      all_tiles.push({
         level: level,
         level_tiles: level_tiles
      })
      if (level_tiles.length > max_tiles && !list_all) {
         break;
      }
   }
   return all_tiles.filter(tiles => tiles.level_tiles.length)
      .sort((a, b) => a.level > b.level ? 1 : -1)
}

export class FractoRasterImage extends Component {

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
      update_counter: 0,
      filter_level: 0,
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
      const ctx = canvas.getContext('2d');
      let height_px = Math.round(width_px * aspect_ratio);
      if (height_px & 1) {
         height_px -= 1
      }
      this.setState({
         height_px: height_px,
         ctx: ctx
      })

      setTimeout(() => {
         const canvas_buffer = this.init_canvas_buffer()
         this.fill_canvas_buffer(canvas_buffer, ctx)
      }, 100)
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const width_px_changed = prevProps.width_px !== this.props.width_px;
      const aspect_ratio_changed = prevProps.aspect_ratio !== this.props.aspect_ratio;
      const focal_point_x_changed = prevProps.focal_point.x !== this.props.focal_point.x;
      const focal_point_y_changed = prevProps.focal_point.y !== this.props.focal_point.y;
      const scope_changed = prevProps.scope !== this.props.scope;
      const disabled_changed = false// prevProps.disabled !== this.props.disabled;
      const filter_level_changed = this.props.filter_level && prevProps.filter_level !== this.props.filter_level;
      const update_counter_changed = false// this.props.update_counter && prevProps.update_counter !== this.props.update_counter;
      let canvas_buffer = this.state.canvas_buffer
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
         || disabled_changed
         || update_counter_changed) {
         this.fill_canvas_buffer(canvas_buffer, this.state.ctx);
      }
   }

   init_canvas_buffer = () => {
      const {canvas_buffer, ctx} = this.state
      const {width_px, aspect_ratio} = this.props
      if (canvas_buffer) {
         ctx.fillStyle = '#eeeeee'
         ctx.fillRect(0, 0, width_px, width_px);
         return (canvas_buffer)
      }
      if (!width_px) {
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

   fill_canvas_buffer = async (canvas_buffer, ctx) => {
      const {canvas_ref} = this.state
      const {
         width_px,
         focal_point,
         scope,
         aspect_ratio,
         on_plan_complete,
         filter_level,
      } = this.props
      const all_level_sets = []
      get_tiles(width_px, focal_point, scope, aspect_ratio)
         .forEach(level_set => {
            if (filter_level && filter_level !== level_set.level) {
               return;
            }
            all_level_sets.push(level_set)
         })
      const level_data_sets = all_level_sets
         .map(level_set => {
            const tile_width =
               level_set.level_tiles[0].bounds.right
               - level_set.level_tiles[0].bounds.left
            level_set.tile_increment = tile_width / 256
            return level_set
         })
         .sort((a, b) => a.level > b.level ? -1 : 1)
      level_data_sets.forEach(level_set => {
         level_set.level_tiles.forEach(async tile => {
            if (BAD_TILES[tile.short_code]) {
               return;
            }
            await FractoTileCache.get_tile(tile.short_code)
         })
      })
      await this.raster_fill(canvas_buffer, level_data_sets, ctx)
      if (on_plan_complete) {
         on_plan_complete(canvas_buffer, ctx, canvas_ref.current)
      }
      this.setState({loading_tiles: false})
   }

   raster_fill = async (canvas_buffer, level_data_sets, ctx) => {
      const {
         width_px,
         focal_point,
         scope,
         aspect_ratio,
      } = this.props
      const canvas_increment = scope / width_px
      const horz_scale = []
      const leftmost = focal_point.x - scope / 2
      for (let horz_x = 0; horz_x < width_px; horz_x++) {
         horz_scale[horz_x] = leftmost + horz_x * canvas_increment
      }
      const vert_scale = []
      const topmost = focal_point.y + scope * aspect_ratio / 2
      const height_px = width_px * aspect_ratio
      for (let vert_y = 0; vert_y < height_px; vert_y++) {
         vert_scale[vert_y] = Math.abs(topmost - vert_y * canvas_increment)
      }
      for (let canvas_x = 0; canvas_x < width_px; canvas_x++) {
         const x = horz_scale[canvas_x]
         for (let canvas_y = 0; canvas_y < height_px; canvas_y++) {
            const y = vert_scale[canvas_y]
            let found_point = false
            for (let index = 0; index < level_data_sets.length; index++) {
               const level_data_set = level_data_sets[index]
               const tile = level_data_set.level_tiles
                  .find(tile => tile.bounds.left < x
                     && tile.bounds.right > x
                     && tile.bounds.top > y
                     && tile.bounds.bottom < y)
               if (tile) {
                  if (BAD_TILES[tile.short_code]) {
                     continue;
                  }
                  const tile_data = await FractoTileCache.get_tile(tile.short_code)
                  if (!tile_data) {
                     BAD_TILES[tile.short_code] = true
                     continue;
                  }
                  const tile_x = Math.floor(
                     (x - tile.bounds.left) / level_data_set.tile_increment)
                  if (!tile_data[tile_x]) {
                     continue
                  }
                  const tile_y = Math.floor(
                     (tile.bounds.top - y) / level_data_set.tile_increment)
                  if (!tile_data[tile_x][tile_y]) {
                     continue
                  }
                  const pattern = tile_data[tile_x][tile_y][0]
                  const iteration = tile_data[tile_x][tile_y][1]
                  if (canvas_buffer && canvas_buffer[canvas_x] && canvas_buffer[canvas_x][canvas_y]) {
                     canvas_buffer[canvas_x][canvas_y] = [pattern, iteration]
                  }
                  const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(pattern, iteration)
                  ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
                  ctx.fillRect(canvas_x, canvas_y, 2, 2);
                  found_point = true
                  break;
               }
            }
            if (!found_point && (x < -2 || x > 1 || y > 1 || y < -1)) {
               const {pattern, iteration} = FractoFastCalc.calc(x, y)
               if (canvas_buffer && canvas_buffer[canvas_x] && canvas_buffer[canvas_x][canvas_y]) {
                  canvas_buffer[canvas_x][canvas_y] = [pattern, iteration]
               }
               const [hue, sat_pct, lum_pct] =
                  FractoUtil.fracto_pattern_color_hsl(pattern, iteration)
               ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
               ctx.fillRect(canvas_x, canvas_y, 2, 2);
            }
         }
      }
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

export default FractoRasterImage
