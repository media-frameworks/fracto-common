import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";
import FractoCalc from "./FractoCalc";
import FractoUtil from "../FractoUtil";

const FractoCanvas = styled.canvas`
   margin: 0;
`;

const CHUNK_SIZE = 10000;

export class FractoDirectCanvas extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      aspect_ratio: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      save_filename: PropTypes.string,
   }

   state = {
      canvas_ref: React.createRef(),
      points_list: []
   };

   componentDidMount() {
      this.fill_canvas()
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const focal_point_x_changed = prevProps.focal_point.x !== this.props.focal_point.x;
      const focal_point_y_changed = prevProps.focal_point.y !== this.props.focal_point.y;
      const scope_changed = prevProps.scope !== this.props.scope;
      if (!focal_point_x_changed && !focal_point_y_changed && !scope_changed) {
         return;
      }
      this.fill_canvas();
   }

   calc_points = (starting_at, ctx) => {
      const {points_list} = this.state
      if (starting_at >= points_list.length) {
         return;
      }
      for (let i = starting_at; i < starting_at + CHUNK_SIZE; i++) {
         if (i >= points_list.length) {
            break;
         }
         const calc_values = FractoCalc.calc(points_list[i].x, points_list[i].y)
         const [hue, sat_pct, lum_pct] = FractoUtil.fracto_pattern_color_hsl(calc_values.pattern, calc_values.iteration)
         ctx.fillStyle = `hsl(${hue}, ${sat_pct}%, ${lum_pct}%)`
         ctx.fillRect(points_list[i].img_x, points_list[i].img_y, 1, 1);
      }
      setTimeout(() => {
         this.calc_points(starting_at + CHUNK_SIZE, ctx)
      }, 100)
   }

   calc_direct = (canvas_bounds, ctx) => {
      const {width_px, aspect_ratio} = this.props;
      const height_px = width_px * aspect_ratio;
      console.log("calc_direct", canvas_bounds)
      const scope_x = canvas_bounds.right - canvas_bounds.left
      const increment = scope_x / width_px;
      const points_list = []
      for (let img_x = 0; img_x < width_px; img_x++) {
         const x = canvas_bounds.left + img_x * increment
         for (let img_y = 0; img_y < height_px; img_y++) {
            const y = canvas_bounds.top - img_y * increment
            points_list.push({
               img_x: img_x,
               img_y: img_y,
               x: x,
               y: y
            })
         }
      }
      this.setState({points_list: points_list})
      setTimeout(() => {
         this.calc_points(0, ctx)
      }, 100)
   }

   fill_canvas = () => {
      const {canvas_ref} = this.state;
      const {width_px, aspect_ratio, focal_point, scope} = this.props;
      const height_px = width_px * aspect_ratio;

      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = `white`
      ctx.fillRect(0, 0, width_px, height_px);

      const half_width = scope / 2;
      const half_height = (aspect_ratio * scope) / 2;
      const canvas_bounds = {
         left: focal_point.x - half_width,
         right: focal_point.x + half_width,
         top: focal_point.y + half_height,
         bottom: focal_point.y - half_height,
      }

      this.calc_direct(canvas_bounds, ctx)
   }

   save_png = () => {
      const {canvas_ref} = this.state;
      const {save_filename} = this.props;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      if (!save_filename) {
         console.log('no save_filename');
         return;
      }
      var url = canvas.toDataURL("image/png");
      var link = document.createElement('a');
      link.download = `${save_filename}.png`;
      link.href = url;
      link.click();
   }

   render() {
      const {canvas_ref} = this.state;
      const {width_px, aspect_ratio} = this.props;
      const height_px = width_px * aspect_ratio;
      return <FractoCanvas
         onClick={e => this.save_png()}
         ref={canvas_ref}
         width={width_px}
         height={height_px}
      />
   }
}

export default FractoDirectCanvas;
