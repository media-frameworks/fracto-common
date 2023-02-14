import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";
import FractoRender from "./FractoRender";
import FractoLocate from "./FractoLocate";
import {get_ideal_level} from "./FractoData";

export const OPTION_WIDTH_PX = "width_px";
export const OPTION_ASPECT_RATIO = "aspect_ratio";
export const OPTION_POINT_HIGHLIGHTS = "point_highlights";
export const OPTION_TILE_OUTLINE = "tile_outline";
export const OPTION_RENDER_LEVEL = "render_level";

const DEFAULT_WIDTH_PX = 450;
const DEFAULT_ASPECT_RATIO = 1.0;
const DEFAULT_POINT_HIGHLIGHTS = [];

const RenderWrapper = styled(AppStyles.InlineBlock)`
   margin: 0 1rem 1rem 0;
   border: 0.125rem solid #aaaaaa;
   border-radius: 0.25rem;
`;

const LocateWrapper = styled(AppStyles.Block)`   
   ${AppStyles.noselect}
   border: 0.125rem solid #aaaaaa;
   width: 32rem;
   height: 6.25rem;
   border-radius: 0.25rem;
`;

const SelectedTileBox = styled.div`
   position: fixed;
   border: 2px dashed white;
   pointer-events: none;
`;

const SelectedTileBoxOutline = styled.div`
   position: fixed;
   border: 2px dashed #888888;
   pointer-events: none;
`;

export class FractoActionWrapper extends Component {

   static propTypes = {
      fracto_values: PropTypes.object.isRequired,
      content: PropTypes.array.isRequired,
      on_update: PropTypes.func,
      options: PropTypes.object,
   }

   static fracto_ref = React.createRef();

   static defaultProps = {
      on_update: null,
      options: {}
   }

   componentDidMount() {
      const {options} = this.props;
      console.log("FractoActionWrapper", options)
   }

   get_tile_outline = (bounds) => {
      const {fracto_values, options} = this.props;
      const width_px = options[OPTION_WIDTH_PX] || DEFAULT_WIDTH_PX
      if (!bounds || !FractoActionWrapper.fracto_ref.current) {
         return [];
      }
      const pixel_width = fracto_values.scope / width_px;
      const half_width_px = width_px / 2;
      const half_height_px = width_px / 2;
      const box_left = half_width_px - (fracto_values.focal_point.x - bounds.left) / pixel_width;
      const box_right = half_width_px - (fracto_values.focal_point.x - bounds.right) / pixel_width;
      const box_top = half_height_px - (bounds.top - fracto_values.focal_point.y) / pixel_width;
      const box_bottom = half_height_px - (bounds.bottom - fracto_values.focal_point.y) / pixel_width;
      const fracto_bounds = FractoActionWrapper.fracto_ref.current.getBoundingClientRect();
      const white_border = {
         left: `${box_left + fracto_bounds.left}px`,
         top: `${box_top + fracto_bounds.top}px`,
         width: `${box_right - box_left}px`,
         height: `${box_bottom - box_top}px`
      };
      const black_border = {
         left: `${box_left + fracto_bounds.left - 2}px`,
         top: `${box_top + fracto_bounds.top - 2}px`,
         width: `${box_right - box_left + 4}px`,
         height: `${box_bottom - box_top + 4}px`
      };
      return [
         <SelectedTileBoxOutline style={black_border}/>,
         <SelectedTileBox style={white_border}/>
      ]
   }

   on_update = () => {
      const {on_update} = this.props;
      if (on_update) {
         on_update ()
      }
   }

   render() {
      const {fracto_values, content, options} = this.props;
      const width_px = options[OPTION_WIDTH_PX] || DEFAULT_WIDTH_PX
      const render_level = options[OPTION_RENDER_LEVEL] || get_ideal_level(width_px, fracto_values.scope)
      const fracto_render = <FractoRender
         width_px={width_px}
         aspect_ratio={options[OPTION_ASPECT_RATIO] || DEFAULT_ASPECT_RATIO}
         initial_params={fracto_values}
         on_param_change={this.on_update}
         point_highlights={options[OPTION_POINT_HIGHLIGHTS] || DEFAULT_POINT_HIGHLIGHTS}
         render_level={render_level}
      />
      const fracto_locate = <FractoLocate
         level={render_level}
         fracto_values={fracto_values}
         cb={this.on_update}
      />
      const selected_box = options[OPTION_TILE_OUTLINE] ? this.get_tile_outline(options[OPTION_TILE_OUTLINE]) : '';
      return [
         <RenderWrapper
            ref={FractoActionWrapper.fracto_ref}>
            {fracto_render}
         </RenderWrapper>,
         <AppStyles.InlineBlock>
            <LocateWrapper>{fracto_locate}</LocateWrapper>
            <AppStyles.Block>{content}</AppStyles.Block>
         </AppStyles.InlineBlock>,
         selected_box
      ]
   }

}

export default FractoActionWrapper
