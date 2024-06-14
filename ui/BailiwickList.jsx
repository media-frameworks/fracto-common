import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolColors, CoolStyles} from "common/ui/CoolImports";

import BailiwickData from "fracto/common/feature/BailiwickData";
import {render_pattern_block} from "fracto/common/FractoStyles";

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

const NameWrapper = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.bold}
   ${CoolStyles.italic}
   ${CoolStyles.ellipsis}
   line-height: 1.5rem;
   letter-spacing: 0.1rem;
   width: 13rem;
   font-size: 0.9rem;
   margin-left: 0.5rem;
   color: #666666;
`;

export class BailiwickList extends Component {

   static propTypes = {
      on_select: PropTypes.func.isRequired,
      in_wait: PropTypes.bool.isRequired,
   }

   state = {
      all_bailiwicks: [],
      selected_index: 0,
      scroll_ref: React.createRef()
   };

   componentDidMount() {
      BailiwickData.fetch_bailiwicks(all_bailiwicks => {
         this.setState({all_bailiwicks: all_bailiwicks})
         const selected_index = parseInt( localStorage.getItem("selected_bailiwick"))
         this.select_bailiwick(all_bailiwicks[selected_index], selected_index)
         setTimeout(() => {
            const scroll_element = this.state.scroll_ref.current
            if (scroll_element) {
               scroll_element.scrollIntoView({ behavior: 'smooth' });
            }
         }, 100)
      })
   }

   select_bailiwick = (item, i)=> {
      const {on_select, in_wait} = this.props
      if (!item || in_wait) {
         return;
      }
      localStorage.setItem('selected_bailiwick', String(i))
      let item_copy = JSON.parse(JSON.stringify(item))
      item_copy.free_ordinal = i
      on_select(item_copy)
      this.setState({selected_index: i})
   }

   render(){
      const {all_bailiwicks, selected_index, scroll_ref} = this.state
      const {in_wait} = this.props
      return all_bailiwicks.map((item, i) => {
         const pattern_block = render_pattern_block(item.pattern)
         const selected = selected_index === i
         const row_style = !selected ? {} : {
            border: `0.1rem solid ${CoolColors.deep_blue}`,
            borderRadius: `0.25rem`,
            backgroundColor: "#cccccc",
            color: "white",
            cursor: in_wait ? "wait" : "pointer"
         }
         const bailiwick_name = item.name // FractoUtil.bailiwick_name(item.pattern, core_point, highest_level)
         return <RowWrapper
            ref={selected ? scroll_ref : null}
            onClick={e => this.select_bailiwick(item, i) }
            style={row_style}>
            <BlockWrapper>{pattern_block}</BlockWrapper>
            <NameWrapper>{bailiwick_name}</NameWrapper>
         </RowWrapper>
      })
   }

}

export default BailiwickList;
