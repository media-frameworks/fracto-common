import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles, CoolTable} from 'common/ui/CoolImports';
import {
   CELL_ALIGN_CENTER,
   CELL_ALIGN_LEFT,
   CELL_TYPE_CALLBACK,
   CELL_TYPE_TEXT
} from "common/ui/CoolTable";
import FractoUtil from "fracto/common/FractoUtil";
import {render_pattern_block} from "fracto/common/FractoStyles";

const COLOR_BAR_WIDTH_PX = 350;
const ROW_HEIGHT_PX = 15;

var ORBITALS_HEADERS = [
   {
      id: "orbital",
      label: "#",
      type: CELL_TYPE_CALLBACK,
      width_px: 40,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "count_pct",
      label: "pixels (%)",
      type: CELL_TYPE_TEXT,
      width_px: 100,
      align: CELL_ALIGN_LEFT,
      style: {
         fontfamily: 'monospace',
         fontSize: '0.80rem',
         color: '#444444'
      }
   },
   {
      id: "color_bar",
      label: `...`,
      type: CELL_TYPE_CALLBACK,
      width_px: COLOR_BAR_WIDTH_PX
   },
]

const BinsWrapper = styled(CoolStyles.Block)`
   background-color: white;
   padding: 0.5rem 0.5rem;
   margin-left: 0.5rem;
`
const TableWrapper = styled(CoolStyles.Block)`
   margin-bottom: 0.5rem;
`

const ColorBarSegment = styled(CoolStyles.InlineBlock)`
   height: ${ROW_HEIGHT_PX}px;
   margin-bottom: 0.5rem;
`;

const OthersWrapper = styled(CoolStyles.Block)`
   background-color: white;
   margin: 0.25rem 0 0 1rem;
`

const OthersLabel = styled(CoolStyles.Block)`
   ${CoolStyles.italic}
   color: #444444;
   margin: 0.25rem 0 0.25rem 0;
   font-size: 0.85rem;
`;

const ColorBlockWrapper = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.noselect}
   margin-right: 0.5rem;
   margin-bottom: 0.25rem;
`;


export class FractoOrbitalsList extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      canvas_buffer: PropTypes.array.isRequired,
      update_counter: PropTypes.number.isRequired,
   }

   state = {
      orbital_bins: {}
   }

   componentDidMount() {
      this.fill_pattern_bins()
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
      if (prevProps.update_counter === this.props.update_counter) {
         return;
      }
      this.fill_pattern_bins()
   }

   fill_pattern_bins = () => {
      const {canvas_buffer} = this.props
      let orbital_bins = {
         total_count: 0,
         max_bin: 1
      }
      for (let img_x = 0; img_x < canvas_buffer.length; img_x++) {
         for (let img_y = 0; img_y < canvas_buffer[img_x].length; img_y++) {
            const [pattern, iteration] = canvas_buffer[img_x][img_y]
            if (pattern === 0) {
               continue
            }
            const orbital_key = `orbital_${pattern}`
            if (!(orbital_key in orbital_bins)) {
               orbital_bins[orbital_key] = {
                  orbital: pattern,
                  bin_count: 0,
                  iterations: {}
               }
            }
            const iteration_key = `iteration_${iteration}`
            if (!(iteration_key in orbital_bins[orbital_key].iterations)) {
               orbital_bins[orbital_key].iterations[iteration_key] = {
                  iteration: iteration,
                  count: 0
               }
            }
            orbital_bins.total_count += 1
            orbital_bins[orbital_key].bin_count += 1
            orbital_bins[orbital_key].iterations[iteration_key].count += 1
            if (orbital_bins[orbital_key].bin_count > orbital_bins.max_bin) {
               orbital_bins.max_bin = orbital_bins[orbital_key].bin_count
            }
         }
      }
      this.setState({orbital_bins: orbital_bins})
   }

   color_bar = (bin) => {
      const {orbital_bins} = this.state
      const bar_width_px = COLOR_BAR_WIDTH_PX * (bin.bin_count / orbital_bins.max_bin)
      const iteration_keys = Object.keys(bin.iterations)
      let all_iterations = []
      for (let bin_index = 0; bin_index < iteration_keys.length; bin_index++) {
         const iteration_block = bin.iterations[iteration_keys[bin_index]]
         for (let i = 0; i < iteration_block.count; i++) {
            all_iterations.push(iteration_block.iteration)
         }
      }
      const sorted_iterations = all_iterations.sort()
      const highest_iteration = sorted_iterations[0]
      const lowest_iteration = sorted_iterations[sorted_iterations.length - 1]
      const color_lowest = FractoUtil.fracto_pattern_color(bin.orbital, lowest_iteration)
      const color_highest = FractoUtil.fracto_pattern_color(bin.orbital, highest_iteration)
      const direction = bin.orbital === 0 ? "to right" : "to left"
      const style = {
         backgroundImage: `linear-gradient(${direction}, ${color_lowest}, ${color_highest})`,
         width: `${bar_width_px}px`
      };
      return <ColorBarSegment
         key={`colorbar_${bin.orbital}_`}
         style={style}
         title={bin.orbital}
      />
   }

   render_bins = () => {
      const {orbital_bins} = this.state
      const {width_px} = this.props
      const bin_keys = Object.keys(orbital_bins);
      if (bin_keys.length === 0) {
         return "no data"
      }
      const sorted_bins = bin_keys
         .filter(key => key !== 'total_count')
         .filter(key => key !== 'max_bin')
         .map(key => orbital_bins[key])
         .sort((a, b) => a.orbital > b.orbital ? 1 : -1)
      const prominent_orbitals = JSON.parse(JSON.stringify(sorted_bins))
         .filter(bin => bin.bin_count > 300)
         .sort((a, b) => a.bin_count > b.bin_count ? -1 : 1)
         .slice(0, 20)
         .map(bin => bin.orbital)
      const lesser_orbitals = JSON.parse(JSON.stringify(sorted_bins))
         .filter(bin => bin.bin_count <= 300)
      const data = prominent_orbitals.sort((a, b) => a - b)
         .map(orbital => {
            const orbital_bin = sorted_bins.find(bin => bin.orbital === orbital)
            const pct = Math.round(orbital_bin.bin_count * 10000 / orbital_bins.total_count) / 100
            return {
               orbital: [render_pattern_block, orbital_bin.orbital],
               count_pct: `${orbital_bin.bin_count} (${pct}%)`,
               color_bar: [this.color_bar, orbital_bin]
            }
         })
      const and_the_rest = lesser_orbitals
         .filter(bin => bin.bin_count > 50)
         .map(bin => {
            const pct = Math.round(bin.bin_count * 10000 / orbital_bins.total_count) / 100
            return <ColorBlockWrapper
               title={`${bin.bin_count} (${pct}%)`}>
               {render_pattern_block(bin.orbital)}
            </ColorBlockWrapper>
         })
      const others_block = [
         <OthersLabel>Other orbitals represented:</OthersLabel>,
         <OthersWrapper>{and_the_rest}</OthersWrapper>
      ]
      ORBITALS_HEADERS[2].width_px = width_px - 235
      return <BinsWrapper>
         <OthersLabel>{`${orbital_bins.total_count} pixels have orbital values:`}</OthersLabel>
         <TableWrapper><CoolTable
            data={data}
            columns={ORBITALS_HEADERS}
         />
         </TableWrapper>
         {lesser_orbitals.length ? others_block : ''}
      </BinsWrapper>
   }

   render() {
      return <CoolStyles.Block style={{backgroundColor: 'white'}}>
         {this.render_bins()}
      </CoolStyles.Block>
   }
}

export default FractoOrbitalsList
