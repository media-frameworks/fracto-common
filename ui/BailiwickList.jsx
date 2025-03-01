import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolColors, CoolStyles} from "common/ui/CoolImports";

import {render_pattern_block} from "../FractoStyles";
import BailiwickDetails from "./BailiwickDetails";
import ReactTimeAgo from "react-time-ago";

const RowWrapper = styled(CoolStyles.Block)`
    ${CoolStyles.pointer}
    vertical-align: center;
    padding: 0.125rem;

    &:hover {
        background-color: #eeeeee;
    }
`;

const BlockWrapper = styled(CoolStyles.InlineBlock)`
    ${CoolStyles.pointer}
    ${CoolStyles.align_center}
    width: 3.5rem;
    vertical-align: center;
`;

const SizeWrapper = styled(CoolStyles.InlineBlock)`
    ${CoolStyles.bold}
    ${CoolStyles.italic}
    ${CoolStyles.ellipsis}
    line-height: 1.5rem;
    letter-spacing: 0.1rem;
    font-size: 0.9rem;
    margin-left: 0.5rem;
    color: #666666;
`;

const UpdatedWrapper = styled(CoolStyles.InlineBlock)`
    ${CoolStyles.italic}
    line-height: 1.5rem;
    letter-spacing: 0.1rem;
    font-size: 0.9rem;
    margin-left: 0.5rem;
    color: #666666;
`;

const StatValue = styled(CoolStyles.InlineBlock)`
    ${CoolStyles.monospace}
    ${CoolStyles.bold}
    font-size: 0.95rem;
    color: black;
`;

const InlineWrapper = styled(CoolStyles.InlineBlock)`
    margin-left: 0.25rem;
`;

export class BailiwickList extends Component {

   static propTypes = {
      bailiwick_list: PropTypes.array.isRequired,
      selected_index: PropTypes.func.isRequired,
      on_select: PropTypes.func.isRequired,
      in_wait: PropTypes.bool.isRequired,
   }

   state = {
      scroll_ref: React.createRef()
   };

   componentDidMount() {
   }

   select_bailiwick = (item, i) => {
      const {on_select, in_wait, selected_index} = this.props
      // if (!item || in_wait || selected_index === i) {
      //    return;
      // }
      localStorage.setItem('selected_bailiwick', String(i))
      let item_copy = JSON.parse(JSON.stringify(item))
      on_select(item_copy, i)
   }

   render_magnitude = (item) => {
      const rounded = Math.round(item.magnitude * 100000000) / 100
      const mu = <i>{'\u03BC'}</i>
      return <CoolStyles.Block>
         <InlineWrapper><StatValue>{rounded}</StatValue>{mu}</InlineWrapper>
      </CoolStyles.Block>
   }

   render() {
      const {scroll_ref} = this.state
      const {bailiwick_list, selected_index, in_wait} = this.props
      return bailiwick_list
         .map((item, i) => {
            const pattern_block = render_pattern_block(item.pattern)
            const selected = selected_index === i
            const row_style = !selected ? {cursor: 'pointer'} : {
               border: `0.1rem solid ${CoolColors.deep_blue}`,
               borderRadius: `0.25rem`,
               backgroundColor: "#cccccc",
               color: "white",
               padding: '0.25rem 0.375rem',
               margin: '0.125rem 0',
               cursor: in_wait ? "wait" : 'default',
            }
            const highest_level = Math.round(100 * (Math.log(32 / item.magnitude) / Math.log(2))) / 100
            const updated_at = <ReactTimeAgo date={item.updated_at}/>
            const size = this.render_magnitude(item)
            const row_content = selected
               ? <BailiwickDetails
                  freeform_index={item.free_ordinal}
                  highest_level={highest_level}
                  selected_bailiwick={item}/>
               : [
                  <BlockWrapper
                     key={`pattern_${i}`}>
                     {pattern_block}
                  </BlockWrapper>,
                  <SizeWrapper key={`size_${i}`}>{size}</SizeWrapper>,
                  <UpdatedWrapper key={`updated_${i}`}>{updated_at},</UpdatedWrapper>,
                  <UpdatedWrapper key={`index_${i}`}>{`#${item.free_ordinal + 1} in size`}</UpdatedWrapper>,
               ]
            return <RowWrapper
               onClick={e => this.select_bailiwick(item, i)}
               ref={selected ? scroll_ref : null}
               style={row_style}>
               {row_content}
            </RowWrapper>
         })
   }

}

export default BailiwickList;
