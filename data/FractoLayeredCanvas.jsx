import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

// import {AppStyles} from "app/AppImports";
import StoreS3 from 'common/system/StoreS3';

import FractoData from "../data/FractoData";
import FractoUtil from "../FractoUtil";

const FractoCanvas = styled.canvas`
   margin: 0;
`;

const MAX_TILE_CACHE = 150;

export class FractoLayeredCanvas extends Component {

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
      this.fill_canvas();
   }

   fill_tile = (canvas_bounds, tile_bounds, point_data, bg_factor, ctx) => {
      const {width_px, aspect_ratio, scope} = this.props;

      const height_px = width_px * aspect_ratio;
      const canvas_width = canvas_bounds.right - canvas_bounds.left;
      const canvas_height = canvas_width * aspect_ratio;
      const HEIGHT_PX_BY_CANVAS_HEIGHT = height_px / canvas_height;
      const WIDTH_PX_BY_CANVAS_WIDTH = width_px / canvas_width;

      const tile_span = tile_bounds.right - tile_bounds.left
      const tile_pixel_size = tile_span / 256;
      const canvas_pixel_size = (1.25 * bg_factor / 100) * (width_px * tile_span) / (256 * scope)

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
                  ctx.fillRect(canvas_x, neg_canvas_y, canvas_pixel_size, canvas_pixel_size);
               }
            } else {
               console.error("point_data is broken (point_data, tile_x, tile_y)", point_data, tile_x, tile_y);
            }
         }
      }

   }

   fill_layer = (level, canvas_bounds, bg_factor, ctx, cb) => {
      const {focal_point, scope, aspect_ratio} = this.props;
      if (level < 2) {
         console.log("invalid level", level)
         cb(true);
         return;
      }
      const tiles = FractoData.tiles_in_scope(level, focal_point, scope, aspect_ratio)
      if (tiles.length > 500) {
         console.log("too many tiles", tiles.length)
         cb(true);
         return;
      }
      let tiles_loaded = 0;
      let highest_mru = this.state.highest_mru
      for (let tile_index = 0; tile_index < tiles.length; tile_index++) {
         const tile = tiles[tile_index];
         const short_code = tile.short_code;
         FractoLayeredCanvas.cache_mru[short_code] = highest_mru++;
         if (!FractoLayeredCanvas.tile_cache[short_code]) {
            const filepath = `tiles/256/indexed/${short_code}.json`
            StoreS3.get_file_async(filepath, "fracto", data => {
               // console.log("StoreS3.get_file_async", filepath);
               if (!data) {
                  console.log("data error");
                  this.setState({loading_tiles: false});
                  cb(false);
               } else {
                  const tile_data = JSON.parse(data);
                  FractoLayeredCanvas.tile_cache[short_code] = tile_data;
                  this.fill_tile(canvas_bounds, tile.bounds, tile_data, bg_factor, ctx);
                  tiles_loaded += 1;
                  if (tiles_loaded === tiles.length) {
                     cb(true)
                  }
               }
            }, false)
         } else {
            const tile_data = FractoLayeredCanvas.tile_cache[short_code];
            this.fill_tile(canvas_bounds, tile.bounds, tile_data, bg_factor, ctx);
            tiles_loaded += 1;
            if (tiles_loaded === tiles.length) {
               cb(true)
            }
         }
      }
      this.setState({highest_mru: highest_mru})

      const cache_keys = Object.keys(FractoLayeredCanvas.tile_cache).sort((a, b) =>
         FractoLayeredCanvas.cache_mru[a] - FractoLayeredCanvas.cache_mru[b])
      // console.log("FractoLayeredCanvas.cache_mru", FractoLayeredCanvas.cache_mru)
      for (let key_index = 0; key_index < cache_keys.length - MAX_TILE_CACHE; key_index++) {
         delete FractoLayeredCanvas.tile_cache[cache_keys[key_index]]
         // console.log("deleting tile from cache", cache_keys[key_index])
      }

   }

   fill_canvas = () => {
      const {canvas_ref} = this.state;
      const {aspect_ratio, level, focal_point, scope} = this.props;

      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');

      const half_width = scope / 2;
      const half_height = (aspect_ratio * scope) / 2;
      const canvas_bounds = {
         left: focal_point.x - half_width,
         right: focal_point.x + half_width,
         top: focal_point.y + half_height,
         bottom: focal_point.y - half_height,
      }

      this.fill_layer(level - 2, canvas_bounds, 60, ctx, result => {
         if (!result) {
            this.setState({loading_tiles: false});
            console.log("failed filling layer", level - 2)
            return;
         }
         this.fill_layer(level - 1, canvas_bounds, 80, ctx, result => {
            if (!result) {
               this.setState({loading_tiles: false});
               console.log("failed filling layer", level -1)
               return;
            }
            this.fill_layer(level, canvas_bounds, 100, ctx, result => {
               this.setState({loading_tiles: false});
               if (!result) {
                  console.log("failed filling layer", level)
                  return;
               }
            })
         })
      })
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

export default FractoLayeredCanvas;
