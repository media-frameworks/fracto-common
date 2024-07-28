import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from 'common/ui/CoolImports';
import FractoUtil from "fracto/common/FractoUtil";
import {render_coordinates, render_pattern_block} from "fracto/common/FractoStyles";
import CoolTable, {
   CELL_ALIGN_CENTER, CELL_TYPE_CALLBACK, CELL_TYPE_TEXT, TABLE_CAN_SELECT
} from "common/ui/CoolTable";
import BailiwickData from "../feature/BailiwickData";

const BailiwickNameBlock = styled(CoolStyles.InlineBlock)`
   margin-bottom: 0.25rem;
`;

const BailiwickNameSpan = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.bold}
   ${CoolStyles.monospace}
   ${CoolStyles.narrow_text_shadow}
   font-size: 1.5rem;
`;

const BigColorBox = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.narrow_border_radius}
   ${CoolStyles.narrow_text_shadow}
   ${CoolStyles.monospace}
   ${CoolStyles.bold}
   padding: 0 0.125rem;
   border: 0.1rem solid #555555;
   color: white;
   margin-right: 0.5rem;
   font-size: 1.5rem;
`;

const StatsWrapper = styled(CoolStyles.Block)`
   ${CoolStyles.bold}
   ${CoolStyles.italic}
   font-size: 0.85rem;
   color: #444444;
`;

const StatLabel = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.bold}
   font-size: 0.95rem;
   color: #444444;
   margin-right: 0.25rem;
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

const LowerWrapper = styled(CoolStyles.Block)`
   margin: 0 1rem 0.125rem 1rem;
`;

const PointsWrapper = styled(CoolStyles.Block)`
   margin: 0.5rem 0;
   background-color: white;
   color: #444444;
   width: fit-content;
`;

const PromptWrapper = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.italic}
   ${CoolStyles.bold}
   color: #444444;
   margin-right: 0.5rem;
`

const ShowPointsSpan = styled.span`
   ${CoolStyles.link}
`

const NODES_HEADERS = [
   {
      id: "pattern",
      label: "pattern",
      type: CELL_TYPE_CALLBACK,
      width_px: 50,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "short_form",
      label: "short",
      type: CELL_TYPE_TEXT,
      width_px: 80
   },
   {
      id: "long_form",
      label: "long",
      type: CELL_TYPE_TEXT,
      width_px: 220
   },
]

export class BailiwickDetails extends Component {

   static propTypes = {
      selected_bailiwick: PropTypes.object.isRequired,
      highest_level: PropTypes.number.isRequired,
      freeform_index: PropTypes.number.isRequired
   }

   state = {
      all_node_points: [],
      node_index: 0,
      show_points: false,
   }

   componentDidMount() {
      BailiwickData.fetch_node_points(node_points => {
         this.setState({all_node_points: node_points})
      })
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {selected_bailiwick} = this.props
      if (!prevProps.selected_bailiwick) {
         return
      }
      if (prevProps.selected_bailiwick.id !== selected_bailiwick.id) {
         this.setState({node_index: 0})
      }
   }

   render_magnitude = () => {
      const {selected_bailiwick} = this.props;
      const rounded = Math.round(selected_bailiwick.magnitude * 100000000) / 100
      const mu = <i>{'\u03BC'}</i>
      return <CoolStyles.Block>
         <StatLabel>magnitude:</StatLabel>
         <StatValue>{selected_bailiwick.magnitude}</StatValue>
         <InlineWrapper>(<StatValue>{rounded}</StatValue>{mu})</InlineWrapper>
      </CoolStyles.Block>
   }

   render_cq_code = () => {
      const {selected_bailiwick} = this.props;
      const core_point_data = JSON.parse(selected_bailiwick.core_point)
      const cq_code = FractoUtil.CQ_code_from_point(core_point_data.x, core_point_data.y)
      return <CoolStyles.Block>
         <StatLabel>CQ code:</StatLabel>
         <StatValue>{cq_code.slice(0, 25)}</StatValue>
      </CoolStyles.Block>
   }

   render_core_point = () => {
      const {selected_bailiwick} = this.props;
      const core_point_data = JSON.parse(selected_bailiwick.core_point)
      const core_point = render_coordinates(core_point_data.x, core_point_data.y);
      return <CoolStyles.Block>
         <StatLabel>core point:</StatLabel>
         <StatValue>{core_point}</StatValue>
      </CoolStyles.Block>
   }

   on_select_row = (index) => {
      console.log("on_select_row", index)
      this.setState({node_index: index})
   }

   show_hide_points = () => {

   }

   render() {
      const {all_node_points, node_index, show_points} = this.state
      const {selected_bailiwick, highest_level, freeform_index} = this.props;
      const bailiwick_name = selected_bailiwick.name
      const block_color = FractoUtil.fracto_pattern_color(selected_bailiwick.pattern, 1000)
      const stats = [`best level: ${highest_level}`, `freeform index: ${freeform_index + 1}`].join(', ')
      const table_rows = all_node_points
         .filter(np => np.bailiwick_id === selected_bailiwick.id)
         .sort((a, b) => a.pattern - b.pattern)
         .map(node => {
            return {
               pattern: [render_pattern_block, node.pattern],
               short_form: node.short_form,
               long_form: node.long_form,
            }
         })
      const points = <PointsWrapper>
         <CoolTable
            options={TABLE_CAN_SELECT}
            columns={NODES_HEADERS}
            data={table_rows}
            key={'bailiwick-nodes'}
            on_select_row={this.on_select_row}
            selected_row={node_index}
         />
      </PointsWrapper>
      const points_prompt = <PromptWrapper>{'node points:'}</PromptWrapper>
      const show_hide_link = <ShowPointsSpan
         onClick={e => this.setState({show_points: !show_points})}>
         {show_points ? 'hide' : 'show'}
      </ShowPointsSpan>
      return [
         <CoolStyles.Block>
            <BigColorBox
               style={{backgroundColor: block_color}}>
               {selected_bailiwick.pattern}
            </BigColorBox>
            <BailiwickNameBlock>
               <BailiwickNameSpan>{bailiwick_name}</BailiwickNameSpan>
               <StatsWrapper>{stats}</StatsWrapper>
            </BailiwickNameBlock>
         </CoolStyles.Block>,
         <LowerWrapper>
            {this.render_magnitude()}
            {this.render_cq_code()}
            {this.render_core_point()}
            {points_prompt}
            {show_hide_link}
            {show_points ? points : []}
         </LowerWrapper>
      ]
   }
}

export default BailiwickDetails;
