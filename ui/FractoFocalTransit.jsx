import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from 'common/ui/CoolImports';
import {
   TRANSIT_PADDING_PX,
   CURVED_CORNERS_FACTOR
} from "pages/styles/TabTransitStyles";
import FractoUtil from "../FractoUtil";

const CanvasSubstrate = styled.canvas`
   ${CoolStyles.narrow_box_shadow}
   margin: ${TRANSIT_PADDING_PX}px;
`;

const ARROW_UP_ONE = 'arrow_up_one';
const ARROW_RIGHT_ONE = 'arrow_right_one';
const ARROW_DOWN_ONE = 'arrow_down_one';
const ARROW_LEFT_ONE = 'arrow_left_one';
const ARROW_UP_TWO = 'arrow_up_two';
const ARROW_RIGHT_TWO = 'arrow_right_two';
const ARROW_DOWN_TWO = 'arrow_down_two';
const ARROW_LEFT_TWO = 'arrow_left_two';
const ARROW_UPPER_LEFT_ONE = 'arrow_upper_left_one';
const ARROW_UPPER_RIGHT_ONE = 'arrow_upper_right_one';
const ARROW_LOWER_LEFT_ONE = 'arrow_lower_left_one';
const ARROW_LOWER_RIGHT_ONE = 'arrow_lower_right_one';
const ARROW_UPPER_LEFT_TWO = 'arrow_upper_left_two';
const ARROW_UPPER_RIGHT_TWO = 'arrow_upper_right_two';
const ARROW_LOWER_LEFT_TWO = 'arrow_lower_left_two';
const ARROW_LOWER_RIGHT_TWO = 'arrow_lower_right_two';
const ARROW_UPPER_LEFT_THREE = 'arrow_upper_left_three';
const ARROW_UPPER_RIGHT_THREE = 'arrow_upper_right_three';
const ARROW_LOWER_LEFT_THREE = 'arrow_lower_left_three';
const ARROW_LOWER_RIGHT_THREE = 'arrow_lower_right_three';
const ARROW_UP_THREE = 'arrow_up_three';
const ARROW_RIGHT_THREE = 'arrow_right_three';
const ARROW_LEFT_THREE = 'arrow_left_three';
const ARROW_DOWN_THREE = 'arrow_down_three';

const DIAGONAL_ONE_COLOR = FractoUtil.fracto_pattern_color(17, 50000)
const DIAGONAL_TWO_COLOR = FractoUtil.fracto_pattern_color(17, 2000)
const DIAGONAL_THREE_COLOR = FractoUtil.fracto_pattern_color(17, 10)

export class FractoFocalTransit extends Component {

   static propTypes = {
      width_px: PropTypes.number,
      focal_point: PropTypes.object.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      in_wait: PropTypes.bool.isRequired,
   }

   state = {
      ctx: null,
      canvas_ref: React.createRef(),
      canvas_measure_px: 0,
   }

   componentDidMount() {
      const {canvas_ref} = this.state;
      const {width_px} = this.props;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      this.setState({
         canvas_measure_px: width_px - 2 * TRANSIT_PADDING_PX,
         ctx: ctx
      })
      ctx.fillStyle = '#aaaaaa'
      ctx.fillRect(0, 0, width_px, width_px);
      setTimeout(() => {
         this.draw_paths()
      }, 1000)
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      this.draw_paths()
   }

   make_regions = () => {
      const {canvas_measure_px} = this.state
      const sqrt_two = Math.sqrt(2.0)
      const A_PCT = (1 - 0.618) * 100
      const midway = canvas_measure_px / 2
      const A = A_PCT * canvas_measure_px / 100
      const A_sqrt_two_by_2 = sqrt_two * A / 2
      return [
         {
            id: ARROW_UP_ONE,
            color: FractoUtil.fracto_pattern_color(1, 50000),
            path: [
               {x: midway - A_sqrt_two_by_2 / 4, y: midway - A / 2},
               {x: midway + A_sqrt_two_by_2 / 4, y: midway - A / 2},
               {x: midway + A_sqrt_two_by_2 / 2, y: midway - A_sqrt_two_by_2 / 2},
               {x: midway + A_sqrt_two_by_2 / 4, y: midway - A_sqrt_two_by_2 / 4},
               {x: midway - A_sqrt_two_by_2 / 4, y: midway - A_sqrt_two_by_2 / 4},
               {x: midway - A_sqrt_two_by_2 / 2, y: midway - A_sqrt_two_by_2 / 2},
            ],
         },
         {
            id: ARROW_RIGHT_ONE,
            color: FractoUtil.fracto_pattern_color(3, 50000),
            path: [
               {x: midway + A_sqrt_two_by_2 / 2, y: midway - A_sqrt_two_by_2 / 2},
               {x: midway + A / 2, y: midway - A_sqrt_two_by_2 / 4},
               {x: midway + A / 2, y: midway + A_sqrt_two_by_2 / 4},
               {x: midway + A_sqrt_two_by_2 / 2, y: midway + A_sqrt_two_by_2 / 2},
               {x: midway + A_sqrt_two_by_2 / 4, y: midway + A_sqrt_two_by_2 / 4},
               {x: midway + A_sqrt_two_by_2 / 4, y: midway - A_sqrt_two_by_2 / 4},
            ],
         },
         {
            id: ARROW_DOWN_ONE,
            color: FractoUtil.fracto_pattern_color(5, 50000),
            path: [
               {x: midway + A_sqrt_two_by_2 / 2, y: midway + A_sqrt_two_by_2 / 2},
               {x: midway + A_sqrt_two_by_2 / 4, y: midway + A / 2},
               {x: midway - A_sqrt_two_by_2 / 4, y: midway + A / 2},
               {x: midway - A_sqrt_two_by_2 / 2, y: midway + A_sqrt_two_by_2 / 2},
               {x: midway - A_sqrt_two_by_2 / 4, y: midway + A_sqrt_two_by_2 / 4},
               {x: midway + A_sqrt_two_by_2 / 4, y: midway + A_sqrt_two_by_2 / 4},
            ],
         },
         {
            id: ARROW_LEFT_ONE,
            color: FractoUtil.fracto_pattern_color(7, 50000),
            path: [
               {x: midway - A_sqrt_two_by_2 / 2, y: midway + A_sqrt_two_by_2 / 2},
               {x: midway - A / 2, y: midway + A_sqrt_two_by_2 / 4},
               {x: midway - A / 2, y: midway - A_sqrt_two_by_2 / 4},
               {x: midway - A_sqrt_two_by_2 / 2, y: midway - A_sqrt_two_by_2 / 2},
               {x: midway - A_sqrt_two_by_2 / 4, y: midway - A_sqrt_two_by_2 / 4},
               {x: midway - A_sqrt_two_by_2 / 4, y: midway + A_sqrt_two_by_2 / 4},
            ],
         },
         {
            id: ARROW_UPPER_LEFT_ONE,
            color: DIAGONAL_ONE_COLOR,
            path: [
               {x: midway - A / 2, y: midway - A / 2},
               {x: midway - A_sqrt_two_by_2 / 4, y: midway - A / 2},
               {x: midway - A / 2, y: midway - A_sqrt_two_by_2 / 4},
            ],
         },
         {
            id: ARROW_UPPER_RIGHT_ONE,
            color: DIAGONAL_ONE_COLOR,
            path: [
               {x: midway + A / 2, y: midway - A / 2},
               {x: midway + A / 2, y: midway - A_sqrt_two_by_2 / 4},
               {x: midway + A_sqrt_two_by_2 / 4, y: midway - A / 2},
            ],
         },
         {
            id: ARROW_LOWER_LEFT_ONE,
            color: DIAGONAL_ONE_COLOR,
            path: [
               {x: midway - A / 2, y: midway + A / 2},
               {x: midway - A_sqrt_two_by_2 / 4, y: midway + A / 2},
               {x: midway - A / 2, y: midway + A_sqrt_two_by_2 / 4},
            ],
         },
         {
            id: ARROW_LOWER_RIGHT_ONE,
            color: DIAGONAL_ONE_COLOR,
            path: [
               {x: midway + A / 2, y: midway + A / 2},
               {x: midway + A / 2, y: midway + A_sqrt_two_by_2 / 4},
               {x: midway + A_sqrt_two_by_2 / 4, y: midway + A / 2},
            ],
         },
         {
            id: ARROW_UPPER_LEFT_THREE,
            color: DIAGONAL_THREE_COLOR,
            path: [
               {x: 0, y: 0},
               {x: A_sqrt_two_by_2, y: 0},
               {x: A_sqrt_two_by_2, y: A_sqrt_two_by_2 / 2},
               {x: A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2 / 2},
               {x: A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2},
               {x: 0, y: A_sqrt_two_by_2},
            ],
         },
         {
            id: ARROW_UPPER_RIGHT_THREE,
            color: DIAGONAL_THREE_COLOR,
            path: [
               {x: canvas_measure_px, y: 0},
               {x: canvas_measure_px - A_sqrt_two_by_2, y: 0},
               {x: canvas_measure_px - A_sqrt_two_by_2, y: A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2},
               {x: canvas_measure_px, y: A_sqrt_two_by_2},
            ],
         },
         {
            id: ARROW_LOWER_LEFT_THREE,
            color: DIAGONAL_THREE_COLOR,
            path: [
               {x: 0, y: canvas_measure_px},
               {x: A_sqrt_two_by_2, y: canvas_measure_px},
               {x: A_sqrt_two_by_2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2},
               {x: 0, y: canvas_measure_px - A_sqrt_two_by_2},
            ],
         },
         {
            id: ARROW_LOWER_RIGHT_THREE,
            color: DIAGONAL_THREE_COLOR,
            path: [
               {x: canvas_measure_px, y: canvas_measure_px},
               {x: canvas_measure_px - A_sqrt_two_by_2, y: canvas_measure_px},
               {x: canvas_measure_px - A_sqrt_two_by_2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2},
               {x: canvas_measure_px, y: canvas_measure_px - A_sqrt_two_by_2},
            ],
         },
         {
            id: ARROW_UPPER_LEFT_TWO,
            color: DIAGONAL_TWO_COLOR,
            path: [
               {x: A_sqrt_two_by_2, y: A_sqrt_two_by_2 / 2},
               {x: A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2 / 2},
               {x: A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2},
               {x: midway - A / 2, y: midway - A_sqrt_two_by_2 / 4},
               {x: midway - A / 2, y: midway - A / 2},
               {x: midway - A_sqrt_two_by_2 / 4, y: midway - A / 2},
            ],
         },
         {
            id: ARROW_UPPER_RIGHT_TWO,
            color: DIAGONAL_TWO_COLOR,
            path: [
               {x: canvas_measure_px - A_sqrt_two_by_2, y: A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2},
               {x: canvas_measure_px - (midway - A / 2), y: midway - A_sqrt_two_by_2 / 4},
               {x: canvas_measure_px - (midway - A / 2), y: midway - A / 2},
               {x: canvas_measure_px - (midway - A_sqrt_two_by_2 / 4), y: midway - A / 2},
            ],
         },
         {
            id: ARROW_LOWER_LEFT_TWO,
            color: DIAGONAL_TWO_COLOR,
            path: [
               {x: A_sqrt_two_by_2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2},
               {x: midway - A / 2, y: canvas_measure_px - (midway - A_sqrt_two_by_2 / 4)},
               {x: midway - A / 2, y: canvas_measure_px - (midway - A / 2)},
               {x: midway - A_sqrt_two_by_2 / 4, y: canvas_measure_px - (midway - A / 2)},
            ],
         },
         {
            id: ARROW_LOWER_RIGHT_TWO,
            color: DIAGONAL_TWO_COLOR,
            path: [
               {x: canvas_measure_px - A_sqrt_two_by_2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2},
               {x: canvas_measure_px - (midway - A / 2), y: canvas_measure_px - (midway - A_sqrt_two_by_2 / 4)},
               {x: canvas_measure_px - (midway - A / 2), y: canvas_measure_px - (midway - A / 2)},
               {x: canvas_measure_px - (midway - A_sqrt_two_by_2 / 4), y: canvas_measure_px - (midway - A / 2)},
            ],
         },
         {
            id: ARROW_UP_TWO,
            color: FractoUtil.fracto_pattern_color(1, 5000),
            path: [
               {x: midway - A_sqrt_two_by_2 / 4, y: midway - A / 2},
               {x: midway + A_sqrt_two_by_2 / 4, y: midway - A / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2, y: A_sqrt_two_by_2 / 2},
               {x: A_sqrt_two_by_2, y: A_sqrt_two_by_2 / 2},
            ],
         },
         {
            id: ARROW_DOWN_TWO,
            color: FractoUtil.fracto_pattern_color(5, 1000),
            path: [
               {x: midway - A_sqrt_two_by_2 / 4, y: midway + A / 2},
               {x: midway + A_sqrt_two_by_2 / 4, y: midway + A / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: A_sqrt_two_by_2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
            ],
         },
         {
            id: ARROW_RIGHT_TWO,
            color: FractoUtil.fracto_pattern_color(3, 5000),
            path: [
               {x: midway + A / 2, y: midway - A_sqrt_two_by_2 / 4},
               {x: midway + A / 2, y: midway + A_sqrt_two_by_2 / 4},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2},
            ],
         },
         {
            id: ARROW_LEFT_TWO,
            color: FractoUtil.fracto_pattern_color(7, 5000),
            path: [
               {x: midway - A / 2, y: midway - A_sqrt_two_by_2 / 4},
               {x: midway - A / 2, y: midway + A_sqrt_two_by_2 / 4},
               {x: A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2},
               {x: A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2},
            ],
         },
         {
            id: ARROW_UP_THREE,
            color: FractoUtil.fracto_pattern_color(1, 100),
            path: [
               {x: A_sqrt_two_by_2, y: A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2, y: A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2, y: 0},
               {x: A_sqrt_two_by_2, y: 0},
            ],
         },
         {
            id: ARROW_DOWN_THREE,
            color: FractoUtil.fracto_pattern_color(5, 100),
            path: [
               {x: A_sqrt_two_by_2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2, y: canvas_measure_px - A_sqrt_two_by_2 / 2},
               {x: canvas_measure_px - A_sqrt_two_by_2, y: canvas_measure_px},
               {x: A_sqrt_two_by_2, y: canvas_measure_px},
            ],
         },
         {
            id: ARROW_RIGHT_THREE,
            color: FractoUtil.fracto_pattern_color(3, 100),
            path: [
               {x: canvas_measure_px, y: A_sqrt_two_by_2},
               {x: canvas_measure_px, y: canvas_measure_px - A_sqrt_two_by_2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2},
               {x: canvas_measure_px - A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2},
            ],
         },

         {
            id: ARROW_LEFT_THREE,
            color: FractoUtil.fracto_pattern_color(7, 100),
            path: [
               {x: 0, y: A_sqrt_two_by_2},
               {x: 0, y: canvas_measure_px - A_sqrt_two_by_2},
               {x: A_sqrt_two_by_2 / 2, y: canvas_measure_px - A_sqrt_two_by_2},
               {x: A_sqrt_two_by_2 / 2, y: A_sqrt_two_by_2},
            ],
         },

      ]
   }

   draw_paths = () => {
      const {ctx} = this.state
      const regions = this.make_regions()
      regions.forEach(region => {
         ctx.beginPath();
         const canvas_x0 = region.path[0].x
         const canvas_y0 = region.path[0].y
         ctx.moveTo(canvas_x0, canvas_y0)
         for (let point_index = 1; point_index < region.path.length; point_index++) {
            const canvas_x = region.path[point_index].x
            const canvas_y = region.path[point_index].y
            ctx.lineTo(canvas_x, canvas_y)
         }
         ctx.lineTo(canvas_x0, canvas_y0)
         ctx.closePath();
         ctx.fillStyle = region.color
         ctx.fill()
      })
   }

   render() {
      const {width_px, in_wait} = this.props
      const {canvas_ref} = this.state
      const canvas_style = {
         cursor: in_wait ? "wait" : "pointer",
         borderRadius: `${width_px / CURVED_CORNERS_FACTOR}px`
      }
      return <CanvasSubstrate
         ref={canvas_ref}
         style={canvas_style}
         width={width_px - 2 * TRANSIT_PADDING_PX}
         height={width_px * 1.0 - 2 * TRANSIT_PADDING_PX}
      />
   }
}

export default FractoFocalTransit
