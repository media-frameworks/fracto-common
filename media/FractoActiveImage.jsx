import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

// import {AppStyles} from "app/AppImports";
import FractoLayeredCanvas from "./FractoLayeredCanvas"

const FractoCanvasWrapper = styled.div`
   margin: 0;
`;

export class FractoActiveImage extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      aspect_ratio: PropTypes.number,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_click: PropTypes.func,
      on_zoom: PropTypes.func,
      on_ready: PropTypes.func,
      on_move: PropTypes.func,
      level: PropTypes.number.isRequired,
   }

   static defaultProps = {
      aspect_ratio: 1,
      on_click: null,
      on_zoom: null,
      on_ready: null,
      on_move: null,
   };

   state = {};

   render() {
      const {width_px, aspect_ratio, on_click, on_zoom, on_move, focal_point, scope, level} = this.props;
      const height_px = width_px * aspect_ratio;
      const wrapper_style={
         width: `${width_px}px`,
         height: `${height_px}px`
      }
      return [
         <FractoCanvasWrapper
            onClick={e => {
               if (on_click) {
                  on_click(e);
               }
            }}
            onWheel={e => {
               if (on_zoom) {
                  on_zoom(e);
               }
            }}
            onMouseMove={e => {
               if (on_move) {
                  on_move(e);
               }
            }}
            onMouseOut={e => {
               if (on_move) {
                  on_move(0);
               }
            }}
            style={wrapper_style}>
            <FractoLayeredCanvas
               width_px={width_px}
               aspect_ratio={aspect_ratio}
               focal_point={focal_point}
               scope={scope}
               level={level}
            />
         </FractoCanvasWrapper>
      ]
   }
}

export default FractoActiveImage;
