import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolColors} from 'common/ui/CoolImports';

import FractoUtil from "../FractoUtil";

const OutlineWrapper = styled.div`
   cursor: grab;
`;

export class FractoAlterableOutline extends Component {

   static propTypes = {
      canvas_width_px: PropTypes.number.isRequired,
      wrapper_ref: PropTypes.object.isRequired,
      outline_bounds: PropTypes.object.isRequired,
      focal_point: PropTypes.object.isRequired,
      canvas_scope: PropTypes.number.isRequired,
      on_focal_point_change: PropTypes.func,
      disabled: PropTypes.bool,
   }

   static defaultProps = {
      disabled: false,
   }

   state = {
      outline_ref: React.createRef(),
      in_drag: false,
      drag_start_pos: {},
      drag_ongoing_pos: {},
      dragging_focal_point: {}
   }

   start_drag = (e) => {
      const {in_drag} = this.state
      const {focal_point, disabled} = this.props
      if (disabled || in_drag) {
         return
      }
      console.log("start_drag")
      const drag_start_pos = {y: e.clientY, x: e.clientX}
      this.setState({
         in_drag: true,
         drag_start_pos: drag_start_pos,
         dragging_focal_point: focal_point
      });
      window.addEventListener("mouseup", this.end_drag);
      window.addEventListener("mousemove", this.on_mouse_move);
   }

   end_drag = (e) => {
      const {dragging_focal_point, in_drag} = this.state
      const {on_focal_point_change} = this.props
      if (!in_drag) {
         return
      }
      this.setState({in_drag: false})
      window.removeEventListener("mouseup", this.end_drag);
      window.removeEventListener("mousemove", this.on_mouse_move);
      if (on_focal_point_change) {
         on_focal_point_change(dragging_focal_point)
      }
   }

   on_mouse_move = (e) => {
      const {in_drag, drag_start_pos} = this.state;
      const {focal_point, canvas_width_px, canvas_scope} = this.props
      if (!in_drag) {
         return;
      }
      const drag_ongoing_pos = {
         y: e.clientY,
         x: e.clientX
      }
      const pixel_dimension = canvas_scope / canvas_width_px
      const delta_x = (drag_start_pos.x - drag_ongoing_pos.x) * pixel_dimension
      const delta_y = (drag_ongoing_pos.y - drag_start_pos.y) * pixel_dimension
      const dragging_focal_point = {
         x: focal_point.x - delta_x,
         y: focal_point.y - delta_y
      }
      this.setState({dragging_focal_point: dragging_focal_point})
   }

   render() {
      const {outline_ref, dragging_focal_point, in_drag} = this.state
      const {canvas_width_px, wrapper_ref, outline_bounds, focal_point, canvas_scope, disabled} = this.props
      let current_outline_bounds = outline_bounds
      if (in_drag) {
         const delta_x = dragging_focal_point.x - focal_point.x
         const delta_y = dragging_focal_point.y - focal_point.y
         current_outline_bounds = {
            left: outline_bounds.left + delta_x,
            right: outline_bounds.right + delta_x,
            top: outline_bounds.top + delta_y,
            bottom: outline_bounds.bottom + delta_y ,
         }
      }
      const outline_color = in_drag ? 'cyan' : (disabled ? "#aaaaaa" : "white")
      const outline = FractoUtil.render_tile_outline(wrapper_ref, current_outline_bounds, focal_point, canvas_scope,
         canvas_width_px, outline_color)
      const wrapper_style = {cursor: disabled ? "default" : "grab"}
      return <OutlineWrapper
         ref={outline_ref}
         style={wrapper_style}
         onMouseDown={e => this.start_drag(e)}
         onMouseUp={e => this.end_drag(e)}
         onMouseMove={e => this.on_mouse_move(e)}>
         {outline}
      </OutlineWrapper>
   }
}

export default FractoAlterableOutline
