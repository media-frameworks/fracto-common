import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import CoolTable, {
   CELL_ALIGN_CENTER,
   CELL_TYPE_NUMBER
} from "common/ui/CoolTable";
import network from "common/config/network.json"

const SectionWrapper = styled(CoolStyles.Block)`
    ${CoolStyles.align_center}
    padding: 0.5rem;
    background-color: white;
    margin-left: 1rem;
`

const LinkedCell = styled(CoolStyles.InlineBlock)`
    margin: 0;
`

const IMAGE_SERVER_URL = network.image_server_url

const COVERAGE_TABLE_COLUMNS = [
   {
      id: "level",
      label: "level",
      type: CELL_TYPE_NUMBER,
      width_px: 40,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "tile_count",
      label: "tile count",
      type: CELL_TYPE_NUMBER,
      width_px: 60,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "can_do",
      label: "can do",
      type: CELL_TYPE_NUMBER,
      width_px: 60,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "blank_tiles",
      label: "blank tiles",
      type: CELL_TYPE_NUMBER,
      width_px: 60,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "interior_tiles",
      label: "interior",
      type: CELL_TYPE_NUMBER,
      width_px: 60,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "needs_update_tiles",
      label: "needs update",
      type: CELL_TYPE_NUMBER,
      width_px: 60,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "can_detail_tiles",
      label: "can detail",
      type: CELL_TYPE_NUMBER,
      width_px: 60,
      align: CELL_ALIGN_CENTER
   },
]

export class FractoTileCoverage extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      on_tile_set_changed: PropTypes.func.isRequired,
      selected_level: PropTypes.number.isRequired,
      on_level_selected: PropTypes.func.isRequired,
   }

   state = {
      enhance_tiles: [],
      repair_tiles: [],
      coverage: null,
      render_details: false,
   }

   componentDidMount() {
      this.fetch_coverage()
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
      const {focal_point, scope} = this.props
      const focal_point_x_changed = focal_point.x !== prevProps.focal_point.x
      const focal_point_y_changed = focal_point.y !== prevProps.focal_point.y
      const scope_changed = scope !== prevProps.scope
      if (focal_point_y_changed
         || focal_point_x_changed
         || scope_changed) {
         // this.detect_coverage()
         // const coverage = detect_coverage(focal_point, scope)
         // this.setState({coverage})
         this.fetch_coverage()
      }
   }

   fetch_coverage = async () => {
      const {focal_point, scope} = this.props
      const url = `${IMAGE_SERVER_URL}/tile_coverage?focal_point=${JSON.stringify(focal_point)}&scope=${scope}`
      const result = await fetch(url).then(res => res.json())
      console.log('fetch_coverage', result.coverage)
      this.setState({coverage: result.coverage})
   }

   set_enhanced = (enhance_tiles, level, add_interiors) => {
      const {on_tile_set_changed} = this.props
      this.setState({render_details: false})
      on_tile_set_changed(enhance_tiles, level, false, add_interiors)
   }

   set_can_repair = (repair_tiles, level) => {
      const {on_tile_set_changed} = this.props
      this.setState({render_details: false})
      on_tile_set_changed(repair_tiles, level, true, false)
   }

   on_select_row = (row) => {
      console.log('row', row)
      const {selected_level, on_level_selected} = this.props
      if (selected_level === row.level) {
         on_level_selected(0)
      } else {
         on_level_selected(row.level)
      }
   }

   render_coverage = () => {
      const {coverage} = this.state
      if (!Array.isArray(coverage)) {
         console.log('coverage is not an array', coverage)
         return []
      }
      const coverage_data = coverage.map(data => {
         data.can_do = data.filtered_by_level.length ? <LinkedCell
            onClick={e => this.set_enhanced(data.filtered_by_level, data.level, false)}>
            <CoolStyles.LinkSpan>{data.filtered_by_level.length}</CoolStyles.LinkSpan>
         </LinkedCell> : '-';
         data.blank_tiles = data.blanks_by_level.length ? data.blanks_by_level.length : '-';
         data.interior_tiles = data.interiors_with_bounds.length
            ? <LinkedCell
               onClick={e => this.set_enhanced(data.interiors_with_bounds, data.level, true)}>
               <CoolStyles.LinkSpan>{data.interiors_with_bounds.length}</CoolStyles.LinkSpan>
            </LinkedCell>
            : '-';
         data.needs_update_tiles = data.needs_update_with_bounds.length
            ? <LinkedCell
               onClick={e => this.set_can_repair(data.needs_update_with_bounds, data.level)}>
               <CoolStyles.LinkSpan>{data.needs_update_with_bounds.length}</CoolStyles.LinkSpan>
            </LinkedCell>
            : '-';
         data.tile_count = data.tiles.length ? <LinkedCell
            onClick={e => this.set_can_repair(data.tiles, data.level)}>
            <CoolStyles.LinkSpan>{data.tiles.length}</CoolStyles.LinkSpan>
         </LinkedCell> : '-';
         return data
      });

      return <CoolStyles.InlineBlock>
         <CoolTable
            data={coverage_data}
            columns={COVERAGE_TABLE_COLUMNS}
         />
      </CoolStyles.InlineBlock>;
   }

   render() {
      const {coverage} = this.state
      if (!coverage) {
         return "loading short codes..."
      }
      const coverage_data = this.render_coverage()
      return <SectionWrapper>{coverage_data}</SectionWrapper>
   }
}

export default FractoTileCoverage;
