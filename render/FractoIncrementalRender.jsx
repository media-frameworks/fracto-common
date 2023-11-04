import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

import FractoUtil from "../FractoUtil";
import FractoMruCache from "../data/FractoMruCache";
import FractoIndexedTiles from "../data/FractoIndexedTiles";
import TransitData from "../data/TransitData";

const FractoCanvas = styled.canvas`   
   ${CoolStyles.narrow_box_shadow}
   margin: 0;
`;

export class FractoIncrementalRender extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      level: PropTypes.number.isRequired,
      on_plan_complete: PropTypes.func.isRequired,
      aspect_ratio: PropTypes.number,
      highlight_points: PropTypes.array,
      video_id: PropTypes.number,
      frame_index: PropTypes.number,
   }

   static defaultProps = {
      highlight_points: [],
      aspect_ratio: 1.0,
      video_id: 0,
      frame_index: 0
   }

   state = {
      ctx: null,
      canvas_buffer: null,
      canvas_ref: React.createRef(),
      update_ready: false,
      lowest_iteration: 1000000
   }

   componentDidMount() {
      const {canvas_ref} = this.state;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      this.setState({ctx: ctx})

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
      if (!focal_point_x_changed && !focal_point_y_changed && !scope_changed && !level_changed && !width_px_changed && !aspect_ratio_changed) {
         // console.log("no update")
         return;
      }
      if (this.state.loading_tiles) {
         return;
      }
      this.setState({loading_tiles: true})
      let canvas_buffer = this.state.canvas_buffer
      if (width_px_changed || aspect_ratio_changed) {
         canvas_buffer = this.init_canvas_buffer()
      }
      this.fill_canvas_buffer(canvas_buffer, this.state.ctx);
   }

   init_canvas_buffer = () => {
      const {width_px, aspect_ratio} = this.props
      let height_px = Math.round(width_px * aspect_ratio);
      if (height_px & 1) {
         height_px -= 1
      }
      const canvas_buffer = new Array(width_px).fill(0).map(() => new Array(height_px).fill([0, 4]));
      this.setState({canvas_buffer: canvas_buffer,})
      return canvas_buffer
   }

   fill_canvas_buffer = (canvas_buffer, ctx) => {
      const {level, width_px, aspect_ratio, video_id} = this.props
      let height_px = Math.round(width_px * aspect_ratio);
      if (height_px & 1) {
         height_px -= 1
      }
      let initial_level = level - 2
      if (initial_level < 2) {
         initial_level = 2
      }
      if (video_id) {
         this.add_video_frame(() => {
            const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(0, 4)
            ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
            ctx.fillRect(0, 0, width_px, height_px);
            this.raster_canvas(canvas_buffer, level, ctx)
         })
      } else {
         setTimeout(() => {
            this.raster_canvas(canvas_buffer, level, ctx)
         }, 500)
      }
   }

   raster_canvas = (canvas_buffer, render_level, ctx) => {
      const {aspect_ratio, level, focal_point, scope, on_plan_complete, width_px} = this.props;
      const level_tiles = FractoIndexedTiles.tiles_in_scope(render_level, focal_point, scope, aspect_ratio);
      this.tiles_to_canvas(level_tiles, canvas_buffer, result => {
         console.log(`level ${render_level} complete: ${result}`)
         if (level > render_level) {
            this.raster_canvas(canvas_buffer, render_level + 1, ctx)
         } else {
            this.setState({loading_tiles: false})
            let height_px = Math.round(width_px * aspect_ratio);
            const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(0, this.state.lowest_iteration)
            const default_fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
            for (let img_x = 0; img_x < width_px; img_x++) {
               for (let img_y = 0; img_y < height_px; img_y++) {
                  if (canvas_buffer[img_x][img_y][1] < this.state.lowest_iteration) {
                     ctx.fillStyle = default_fillStyle
                     ctx.fillRect(img_x, img_y, 1, 1);
                  }
               }
            }
            on_plan_complete(canvas_buffer)
         }
      })
   }

   add_video_frame = (cb) => {
      const {canvas_ref} = this.state
      const {video_id, frame_index} = this.props;

      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         cb()
         return;
      }

      const img_data = canvas.toDataURL('image/png', 1.0);
      if (!img_data) {
         console.log("full_frame_complete: no img_data")
         cb()
         return
      }
      TransitData.add_image(img_data, frame_index, video_id, result => {
         console.log("TransitData.add_image #", frame_index)
         cb()
      })
   }

   tiles_to_canvas = (level_tiles, canvas_buffer, cb) => {
      const {ctx, lowest_iteration} = this.state
      const {width_px, aspect_ratio, scope, focal_point} = this.props;
      if (!level_tiles.length) {
         cb(true);
         return;
      }
      const tile = level_tiles.pop()
      const tile_width = tile.bounds.right - tile.bounds.left
      const one_by_tile_width = 1 / tile_width
      const left_edge = focal_point.x - scope / 2;
      const top_edge = focal_point.y + aspect_ratio * scope / 2;
      const increment = scope / width_px;
      let height_px = Math.round(width_px * aspect_ratio);
      if (height_px & 1) {
         height_px -= 1
      }
      FractoMruCache.get_tile_data(tile.short_code, tile_data => {
         this.tiles_to_canvas(level_tiles, canvas_buffer, cb)
         for (let img_x = 0; img_x < width_px; img_x++) {
            const x = left_edge + img_x * increment;
            if (x < tile.bounds.left) {
               continue
            }
            if (x > tile.bounds.right) {
               break
            }
            for (let img_y = 0; img_y < height_px; img_y++) {
               const y = top_edge - img_y * increment;
               if (Math.abs(y) > tile.bounds.top) {
                  continue
               }
               if (Math.abs(y) < tile.bounds.bottom) {
                  continue
               }
               const tile_x = Math.floor(255 * (x - tile.bounds.left) * one_by_tile_width);
               const tile_y = Math.floor(255 * (tile.bounds.top - Math.abs(y)) * one_by_tile_width);
               canvas_buffer[img_x][img_y] = tile_data[tile_x][tile_y];
               const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(
                  tile_data[tile_x][tile_y][0],
                  tile_data[tile_x][tile_y][1])
               ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
               ctx.fillRect(img_x, img_y, 1, 1);
               if (tile_data[tile_x][tile_y][0] === 0 && tile_data[tile_x][tile_y][1] < lowest_iteration) {
                  this.setState({lowest_iteration: tile_data[tile_x][tile_y][1]})
               }
            }
         }
         this.setState({update_ready: true})
      })
   }

   render() {
      const {canvas_ref, loading_tiles} = this.state;
      const {width_px, aspect_ratio, highlight_points, scope, focal_point} = this.props;
      let height_px = Math.round(width_px * aspect_ratio);
      if (height_px & 1) {
         height_px -= 1
      }
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

export default FractoIncrementalRender;