import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from 'common/ui/CoolImports';

import FractoUtil from "../FractoUtil";
import FractoLayeredCanvas from "../data/FractoLayeredCanvas";

const ContextWrapper = styled(CoolStyles.InlineBlock)`
   background-color: #f8f8f8;
`;

export class FractoTileContext extends Component {

   static propTypes = {
      tile: PropTypes.object.isRequired,
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   static wrapper_ref = React.createRef()

   state = {
   };

   render() {
      const {tile, level, width_px} = this.props;
      const wrapper_style = {
         width: `${width_px}px`,
         height: `${width_px}px`,
      }
      const context_scope = 4 * (tile.bounds.right - tile.bounds.left);
      const focal_point = {
         x: (tile.bounds.right + tile.bounds.left) / 2,
         y: (tile.bounds.top + tile.bounds.bottom) / 2
      }
      const tile_outline = !FractoTileContext.wrapper_ref.current ? '' :
         FractoUtil.render_tile_outline(FractoTileContext.wrapper_ref, tile.bounds, focal_point, context_scope, width_px)
      return <ContextWrapper
         ref={FractoTileContext.wrapper_ref}
         style={wrapper_style}>
         <FractoLayeredCanvas
            key={'canvas'}
            width_px={width_px}
            level={level - 1}
            aspect_ratio={1.0}
            scope={context_scope}
            focal_point={focal_point}/>
         {tile_outline}
      </ContextWrapper>
   }
}

export default FractoTileContext;
