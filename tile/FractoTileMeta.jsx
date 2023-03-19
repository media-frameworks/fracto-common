import {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from 'common/ui/CoolImports';

const MetaDataWrapper = styled(CoolStyles.InlineBlock)`
   margin-bottom: 1rem;
`;

const KeySpan = styled.span`
   ${CoolStyles.italic}
   color: #999999;
   font-size: 1.125rem;
`;

const ValueSpan = styled.span`
   ${CoolStyles.monospace}
   color: black;
   font-size: 1.125rem;
`;

export class FractoTileMeta extends Component {

   static propTypes = {
      meta_data: PropTypes.object.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   render() {
      const {meta_data, width_px} = this.props;
      const all_fields = Object.keys(meta_data).map(key => {
         return <CoolStyles.Block key={`metadata-${key}`}>
            <KeySpan>{`${key}: `}</KeySpan>
            <ValueSpan>{`${meta_data[key]}`}</ValueSpan>
         </CoolStyles.Block>
      })
      return <MetaDataWrapper style={{width: `${width_px}px`}}>
         {all_fields}
      </MetaDataWrapper>
   }
}

export default FractoTileMeta;
