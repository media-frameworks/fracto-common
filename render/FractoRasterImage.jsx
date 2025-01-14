import React, {Component} from 'react';
import PropTypes from "prop-types";
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";

import FractoUtil from "../FractoUtil";
import {create_canvas_buffer, fill_canvas_buffer} from "./RasterImageCore"

const FractoCanvas = styled.canvas`
    ${CoolStyles.narrow_box_shadow}
    margin: 0;
`;

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

      ctx.fillStyle = '#eeeeee'// FractoUtil.fracto_pattern_color_hsl(0, 10);
      ctx.fillRect(0, 0, width_px, width_px);
      const canvas_buffer = this.init_canvas_buffer()
      this.fill_canvas_buffer(canvas_buffer, ctx)
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
         ctx.fillStyle = FractoUtil.fracto_pattern_color_hsl(0, 10)
         ctx.fillRect(0, 0, width_px, width_px);
         return (canvas_buffer)
      }
      if (width_px <= 0) {
         return;
      }
      let height_px = Math.round(width_px * aspect_ratio);
      if (height_px & 1) {
         height_px -= 1
      }
      const new_canvas_buffer = create_canvas_buffer(width_px, height_px)
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
         filter_level,
      } = this.props
      fill_canvas_buffer(
         canvas_buffer,
         ctx,
         width_px,
         focal_point,
         scope,
         aspect_ratio,
         on_plan_complete,
         filter_level)
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
