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
   &: hover{
      background-color: #eeeeee;
   }
`;

const BlockWrapper = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.align_center}
   width: 2.5rem;
   vertical-align: center;
`;

const IndexWrapper = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.align_right}
   ${CoolStyles.bold}
   ${CoolStyles.monospace}
   width: 2.5rem;
   vertical-align: center;
`;

const NameWrapper = styled(CoolStyles.InlineBlock)`
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

export class BailiwickList extends Component {

   static propTypes = {
      bailiwick_list: PropTypes.array.isRequired,
      on_select: PropTypes.func.isRequired,
      in_wait: PropTypes.bool.isRequired,
   }

   state = {
      selected_index: 0,
      scroll_ref: React.createRef()
   };

   componentDidMount() {
   }

   select_bailiwick = (item, i) => {
      const {on_select, in_wait} = this.props
      if (!item || in_wait) {
         return;
      }
      localStorage.setItem('selected_bailiwick', String(i))
      let item_copy = JSON.parse(JSON.stringify(item))
      on_select(item_copy)
      this.setState({selected_index: i})
   }

   render() {
      const {selected_index, scroll_ref} = this.state
      const {bailiwick_list, in_wait} = this.props
      return bailiwick_list
         .map((item, i) => {
            const pattern_block = render_pattern_block(item.pattern)
            const selected = selected_index === i
            const row_style = !selected ? {} : {
               border: `0.1rem solid ${CoolColors.deep_blue}`,
               borderRadius: `0.25rem`,
               backgroundColor: "#cccccc",
               color: "white",
               cursor: in_wait ? "wait" : "pointer"
            }
            const highest_level = Math.round(100 * (Math.log(32 / item.magnitude) / Math.log(2))) / 100
            const bailiwick_name = item.name
            const updated_at = <ReactTimeAgo date={item.updated_at}/>
            const row_content = selected
               ? <BailiwickDetails
                  freeform_index={item.free_ordinal}
                  highest_level={highest_level}
                  selected_bailiwick={item}/>
               : [
                  <IndexWrapper key={`index_${i}`}>{`${item.free_ordinal + 1}. `}</IndexWrapper>,
                  <BlockWrapper key={`pattern_${i}`}>{pattern_block}</BlockWrapper>,
                  <NameWrapper key={`name_${i}`}>{bailiwick_name}</NameWrapper>,
                  <UpdatedWrapper key={`updated_${i}`}>{updated_at}</UpdatedWrapper>
               ]
            return <RowWrapper
               ref={selected ? scroll_ref : null}
               onClick={e => this.select_bailiwick(item, i)}
               style={row_style}>
               {row_content}
            </RowWrapper>
         })
   }

}

export default BailiwickList;
