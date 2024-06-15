import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";
import {CoolStyles} from "../../../common/ui/CoolImports";


export class FractoInteractive extends Component {

   static propTypes = {
      wrapped_canvas: PropTypes.array.isRequired,
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      in_wait: PropTypes.bool.isRequired,
      aspect_ratio: PropTypes.number,
      on_click: PropTypes.func,
      on_hover: PropTypes.func,
      on_drag: PropTypes.func,
      on_zoom: PropTypes.func,
   }

   static defaultProps = {
      aspect_ratio: 1.0,
   }

   render() {
      const {wrapped_canvas} =this.props
      return <CoolStyles.InlineBlock
         onClick={this.on_click}
         onDrag={}
         onDragEnd={}
         onDragStart={}
         onWheel={}
         onMouseMove={this.on_mousemove}
         onMouseLeave={this.on_mouseleave}>
         {wrapped_canvas}
      </CoolStyles.InlineBlock>
   }
}

export default FractoInteractive
