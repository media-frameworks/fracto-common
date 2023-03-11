import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from 'common/ui/CoolImports';
import StoreS3 from 'common/system/StoreS3';

import FractoUtil from '../FractoUtil';
import FractoLayeredCanvas from "../data/FractoLayeredCanvas";

const RenderWrapper = styled(CoolStyles.InlineBlock)`
   background-color: #f8f8f8;
`;

export class FractoTileRender extends Component {

   static propTypes = {
      tile: PropTypes.object.isRequired,
      width_px: PropTypes.number.isRequired,
      no_tile_mode: PropTypes.bool,
   }

   static defaultProps = {
      no_tile_mode: false
   }

   state = {
      canvas_ref: React.createRef(),
      tile_loaded: true
   };

   componentDidMount() {
      const {canvas_ref} = this.state;
      const {no_tile_mode} = this.props;
      const canvas = canvas_ref.current;
      if (canvas) {
         const ctx = canvas.getContext('2d');
         this.setState({ctx: ctx})
         if (!no_tile_mode) {
            this.load_tile(ctx);
         }
      }
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {ctx} = this.state;
      const {no_tile_mode} = this.props;
      if (this.props.tile.short_code === prevProps.tile.short_code) {
         return;
      }
      if (!no_tile_mode) {
         this.load_tile(ctx);
      }
   }

   load_tile = (ctx) => {
      const {tile, width_px} = this.props;
      const json_name = `tiles/256/indexed/${tile.short_code}.json`;
      StoreS3.get_file_async(json_name, "fracto", json_str => {
         // console.log("StoreS3.get_file_async", json_name);
         if (!json_str) {
            console.log("Error loading indexed tile", json_name);
            this.setState({tile_loaded: false})
         } else {
            const tile_data = JSON.parse(json_str);
            FractoUtil.data_to_canvas(tile_data, ctx, width_px);
            this.setState({tile_loaded: true})
         }
      }, false)
   }

   render() {
      const {canvas_ref} = this.state;
      const {tile, width_px, no_tile_mode} = this.props;
      const pixels = `${width_px}px`
      const canvas_style = {width: pixels, height: pixels}
      if (no_tile_mode) {
         const scope = tile.bounds.right - tile.bounds.left;
         const focal_point = {
            x: (tile.bounds.right + tile.bounds.left) / 2,
            y: (tile.bounds.top + tile.bounds.bottom) / 2
         }
         const level = tile.short_code.length - 1
         return <RenderWrapper style={canvas_style}>
            <FractoLayeredCanvas
               focal_point={focal_point}
               scope={scope}
               aspect_ratio={1.0}
               level={level}
               width_px={width_px}
            />
         </RenderWrapper>
      }
      else {
         return <RenderWrapper style={canvas_style}>
            <canvas
               key={"just-one-thanks"}
               style={canvas_style}
               ref={canvas_ref}
               width={width_px}
               height={width_px}
            />
         </RenderWrapper>
      }
   }
}

export default FractoTileRender;
