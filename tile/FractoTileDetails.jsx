import {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from 'common/ui/CoolImports';

import {render_short_code, render_coordinates} from 'fracto/common/FractoStyles';

const DetailsWrapper = styled(CoolStyles.InlineBlock)`
   margin-bottom: 1rem;
`;

const ShortCodeWrapper = styled(CoolStyles.InlineBlock)`
   margin-bottom: 0.5rem;
`;

const CoordinatesWrapper = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.align_middle}
   margin-left: 1rem;
   color: #777777;
   font-size: 1.125rem;
   padding-top: 0.125rem;
`;

export class FractoTileDetails extends Component {

   static propTypes = {
      active_tile: PropTypes.object.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {
   };

   render() {
      const {active_tile, width_px} = this.props;
      const short_code = render_short_code(active_tile.short_code)
      const focal_point = {
         x: (active_tile.bounds.right + active_tile.bounds.left) / 2,
         y: (active_tile.bounds.top + active_tile.bounds.bottom) / 2
      }
      const coordinates = render_coordinates(focal_point.x, focal_point.y)
      return <DetailsWrapper style={{width: `${width_px}px`}}>
         <ShortCodeWrapper>{short_code}</ShortCodeWrapper>
         <CoordinatesWrapper>{coordinates}</CoordinatesWrapper>
      </DetailsWrapper>
   }
}

export default FractoTileDetails;
