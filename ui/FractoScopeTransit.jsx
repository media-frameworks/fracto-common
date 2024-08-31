import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from 'common/ui/CoolImports';
import {
   TRANSIT_PADDING_PX,
   CURVED_CORNERS_FACTOR
} from "pages/styles/TabTransitStyles";

const CanvasSubstrate = styled.canvas`
   ${CoolStyles.narrow_box_shadow}
   margin: ${TRANSIT_PADDING_PX}px;
`;

export class FractoScopeTransit extends Component {

   static propTypes = {
      width_px: PropTypes.number,
      height_px: PropTypes.number,
      scope: PropTypes.number.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
      in_wait: PropTypes.bool.isRequired,
   }

   state = {
      ctx: null,
      canvas_ref: React.createRef(),
   }

   componentDidMount() {
      const {canvas_ref} = this.state;
      const {width_px, height_px} = this.props;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      this.setState({ctx: ctx})
      ctx.fillStyle = '#aaaaaa'
      ctx.fillRect(0, 0, width_px, height_px);
   }

   render() {
      const {width_px, height_px, in_wait} = this.props
      const {canvas_ref} = this.state
      const canvas_style = {
         cursor: in_wait ? "wait" : "pointer",
         borderRadius: `${height_px / CURVED_CORNERS_FACTOR}px`
      }
      return <CanvasSubstrate
         ref={canvas_ref}
         style={canvas_style}
         width={width_px - 2 * TRANSIT_PADDING_PX}
         height={height_px - 2 * TRANSIT_PADDING_PX}
      />
   }
}

export default FractoScopeTransit
