import {Component} from 'react';
// import styled from "styled-components";

// import {CoolStyles} from "common/ui/CoolImports";

export class FractoCanvasOverlay extends Component {

   static render_highlights = (ctx, focal_point, scope, highlights) => {
      const canvas = ctx.canvas
      const image_bounds = canvas.getBoundingClientRect();
      const increment = scope / image_bounds.width
      const scope_by_two = scope / 2
      const leftmost = focal_point.x - scope_by_two
      const topmost = focal_point.y + scope_by_two
      for (let h_index = 0; h_index < highlights.length; h_index++) {
         const highlight = highlights[h_index]
         const img_x = (highlight.x - leftmost) / increment
         const img_y = (topmost - highlight.y) / increment

         ctx.lineWidth = 1.5;
         ctx.strokeStyle = '#eeeeee'

         ctx.beginPath();
         ctx.moveTo(img_x - 15, img_y);
         ctx.lineTo(img_x + 15, img_y);
         ctx.stroke();

         ctx.beginPath();
         ctx.moveTo(img_x, img_y - 15);
         ctx.lineTo(img_x, img_y + 15);
         ctx.stroke();

         ctx.strokeRect(img_x - 5, img_y - 5, 10, 10);
      }
      // console.log('render_highlights', image_bounds, highlights)
   }
}

export default FractoCanvasOverlay
