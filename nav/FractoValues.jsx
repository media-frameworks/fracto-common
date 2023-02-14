import React, {Component} from 'react';
import PropTypes from 'prop-types'
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import FractoLocate from "./FractoLocate";
import {get_ideal_level} from "./FractoData";

export const VALUES_BLOCK_WIDTH_PX = 640;

const MetaName = styled(AppStyles.InlineBlock)`
   ${AppStyles.align_middle}
   ${AppStyles.bold}
   ${AppStyles.align_right}
   color: #666666;   
   font-size: 0.85rem;
   padding: 0 0.25rem;
   width: 5rem;
   margin-right: 0.25rem;
`;

const ValuesBlock = styled(AppStyles.Block)`
   min-width: ${VALUES_BLOCK_WIDTH_PX}px;
`;

const ConstantValue = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   ${AppStyles.align_middle}
   font-size: 0.85rem;
`;

export class FractoValues extends Component {

   static propTypes = {
      fracto_values: PropTypes.object.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   render() {
      const {fracto_values, width_px} = this.props;
      return [
         <ValuesBlock>
            <MetaName>{"level:"}</MetaName>
            <ConstantValue>{get_ideal_level(fracto_values.scope, width_px)}</ConstantValue>
         </ValuesBlock>,
         <ValuesBlock>
            <MetaName>{"scope:"}</MetaName>
            <ConstantValue>{fracto_values.scope}</ConstantValue>
         </ValuesBlock>,
         <ValuesBlock style={{marginBottom: "0.25rem"}}>
            <MetaName>{"focal point:"}</MetaName>
            <ConstantValue>{FractoLocate.render_coordinates(fracto_values.focal_point.x, fracto_values.focal_point.y)}</ConstantValue>
         </ValuesBlock>
      ]
   }
}

export default FractoValues;
