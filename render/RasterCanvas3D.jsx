import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {PHI} from "common/math/constants";
import {Vector3d} from "common/math/Vector";

const HolodeckCanvas = styled.canvas`
   position: fixed;
`;

export class RasterCanvas3D extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      controls: PropTypes.object.isRequired,
      grid_vectors: PropTypes.object.isRequired,
      on_render_pixel: PropTypes.func.isRequired,
      update_counter: PropTypes.number.isRequired,
      on_plan_complete: PropTypes.func.isRequired,
      aspect_ratio: PropTypes.number,
   };

   static defaultProps = {
      aspect_ratio: PHI
   }

   state = {
      ctx: null,
      height_px: this.props.width_px / this.props.aspect_ratio,
      canvas_ref: React.createRef(),
   }

   componentDidMount() {
      const {canvas_ref} = this.state;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      this.setState({ctx: ctx});

      this.render_data(ctx)
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
      const width_px_changed = prevProps.width_px !== this.props.width_px
      const update_counter_changed = prevProps.update_counter !== this.props.update_counter
      if (width_px_changed || update_counter_changed) {
         this.render_data(this.state.ctx)
      }
   }

   render_data = (ctx) => {
      const {height_px, canvas_ref} = this.state
      const {width_px, grid_vectors, controls, on_render_pixel, on_plan_complete} = this.props
      const x_increment = 2 / width_px
      const y_increment = 2 / height_px
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, width_px, height_px);
      for (let img_x = 0; img_x < width_px; img_x++) {
         const x_scalar = 1.0 - img_x * x_increment
         const x_component = Vector3d.scale(grid_vectors.h_grid_vector, x_scalar)
         for (let img_y = 0; img_y < height_px; img_y++) {
            const y_scalar = 1.0 - img_y * y_increment
            const y_component = Vector3d.scale(grid_vectors.v_grid_vector, y_scalar)
            const pixel_vector = Vector3d.sum(x_component, y_component)
            const z_factor = (-grid_vectors.pov_vector.direction.z) / (pixel_vector.direction.z - grid_vectors.pov_vector.direction.z)
            const x = controls.focal_x + grid_vectors.pov_vector.direction.x + z_factor * (pixel_vector.direction.x - grid_vectors.pov_vector.direction.x)
            const y = controls.focal_y + grid_vectors.pov_vector.direction.y + z_factor * (pixel_vector.direction.y - grid_vectors.pov_vector.direction.y)
            on_render_pixel(x, y, img_x, img_y, ctx)
         }
      }
      on_plan_complete(canvas_ref)
   }

   render() {
      const {canvas_ref, height_px} = this.state;
      const {width_px} = this.props;
      return <HolodeckCanvas
         ref={canvas_ref}
         width={`${width_px}px`}
         height={`${height_px}px`}
      />
   }
}

export default RasterCanvas3D;
