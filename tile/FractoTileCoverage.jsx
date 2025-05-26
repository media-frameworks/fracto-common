import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import FractoIndexedTiles from "fracto/common/data/FractoIndexedTiles";
import CoolTable, {
   CELL_ALIGN_CENTER, CELL_TYPE_LINK,
   CELL_TYPE_NUMBER,
   TABLE_CAN_SELECT
} from "common/ui/CoolTable";
import {get_ideal_level} from "../data/FractoData";
import {INSPECTOR_SIZE_PX} from "pages/constants";
import FractoUtil from "../FractoUtil";

const SectionWrapper = styled(CoolStyles.Block)`
    ${CoolStyles.align_center}
    padding: 0.5rem;
    background-color: white;
    margin-left: 1rem;
`

const LinkedCell = styled(CoolStyles.InlineBlock)`
    margin: 0;
`

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
      tiles_in_scope: [],
      tile_index: 0,
      all_history: [],
      enhance_tiles: [],
      repair_tiles: [],
      enhance_level: 0,
      repair_level: 0,
      loading_indexed: true,
      loading_blanks: true,
      loading_interiors: true,
      loading_needs_update: true,
      repairs_by_level: {},
   }

   static indexed_tiles = []
   static blank_tiles = []
   static interior_tiles = []
   static needs_update = []

   componentDidMount() {
      if (!FractoTileCoverage.indexed_tiles.length) {
         // FractoTileCoverage.indexed_tiles = []
         for (let level = 0; level < 50; level++) {
            FractoTileCoverage.indexed_tiles[level] = {}
         }
         FractoIndexedTiles.load_short_codes('indexed', short_codes => {
            short_codes.forEach(short_code => {
               const level = short_code.length
               FractoTileCoverage.indexed_tiles[level][short_code] = true
            })
            this.setState({loading_indexed: false})
         })

      } else {
         this.setState({loading_indexed: false})
      }
      if (!FractoTileCoverage.blank_tiles.length) {
         // FractoTileCoverage.blank_tiles = []
         for (let level = 0; level < 50; level++) {
            FractoTileCoverage.blank_tiles[level] = {}
         }
         FractoIndexedTiles.load_short_codes('blank', short_codes => {
            console.log('blank short codes:', short_codes.length)
            short_codes.forEach(short_code => {
               const level = short_code.length
               FractoTileCoverage.blank_tiles[level][short_code] = true
            })
            this.setState({loading_blanks: false})
         })
      } else {
         this.setState({loading_blanks: false})
      }
      if (!FractoTileCoverage.interior_tiles.length) {
         // FractoTileCoverage.interior_tiles = []
         for (let level = 0; level < 50; level++) {
            FractoTileCoverage.interior_tiles[level] = {}
         }
         FractoIndexedTiles.load_short_codes('interior', short_codes => {
            console.log('interior short codes:', short_codes.length)
            short_codes.forEach(short_code => {
               const level = short_code.length
               FractoTileCoverage.interior_tiles[level][short_code] = true
            })
            this.setState({loading_interiors: false})
         })
      } else {
         this.setState({loading_interiors: false})
      }
      if (!FractoTileCoverage.needs_update.length) {
         for (let level = 0; level < 50; level++) {
            FractoTileCoverage.needs_update[level] = {}
         }
         FractoIndexedTiles.load_short_codes('needs_update', short_codes => {
            // console.log('needs_upate short codes:', short_codes.length)
            short_codes.forEach(filename => {
               const short_code = filename.replace('.gz', '')
               const level = short_code.length
               FractoTileCoverage.needs_update[level][short_code] = true
            })
            this.setState({loading_needs_update: false})
         })
      } else {
         this.setState({loading_needs_update: false})
      }
   }

   componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
      const {loading_blanks, loading_indexed} = this.state
      const {focal_point, scope} = this.props
      const focal_point_x_changed = focal_point.x !== prevProps.focal_point.x
      const focal_point_y_changed = focal_point.y !== prevProps.focal_point.y
      const scope_changed = scope !== prevProps.scope
      const loading_indexed_changed = loading_indexed !== prevState.loading_indexed
      const loading_blanks_changed = loading_blanks !== prevState.loading_blanks
      if (focal_point_y_changed
         || focal_point_x_changed
         || scope_changed
         || (!loading_blanks && !loading_indexed
            && (loading_blanks_changed || loading_indexed_changed)
         )
      ) {
         this.detect_coverage()
      }
   }

   detect_coverage = () => {
      const {focal_point, scope} = this.props
      const tiles_in_scope = []
      const ideal_level = get_ideal_level(INSPECTOR_SIZE_PX, scope, 1.5)

      for (let level = 2; level < ideal_level + 12; level++) {
         const level_tiles = FractoIndexedTiles.tiles_in_scope(level, focal_point, scope)
         if (level_tiles.length > 250000) {
            console.log('level_tiles.length', level_tiles.length)
            break
         }
         tiles_in_scope.push({
            level: level,
            tiles: level_tiles
         })
      }
      // console.log('tiles_in_scope', tiles_in_scope)
      const filtered_tiles_in_scope = tiles_in_scope
         .filter(scoped => scoped.tiles.length > 1)
      this.setState({tiles_in_scope: filtered_tiles_in_scope})
   }

   set_enhanced = (enhance_tiles, level) => {
      const {on_tile_set_changed} = this.props
      on_tile_set_changed(enhance_tiles, level, false)
   }

   set_can_repair = (repair_tiles, level) => {
      const {on_tile_set_changed} = this.props
      on_tile_set_changed(repair_tiles, level, true)
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
      const {tiles_in_scope, repairs_by_level} = this.state
      const {selected_level} = this.props
      let all_tiles = []
      const coverage_data = tiles_in_scope.map(scoped => {
         all_tiles = all_tiles.concat(scoped.tiles)
         return {
            level: scoped.level,
            tile_count: scoped.tiles.length,
            tiles: scoped.tiles,
         }
      })
      if (tiles_in_scope.length) {
         coverage_data.push({
            level: tiles_in_scope[tiles_in_scope.length - 1].level + 1,
            tile_count: 0,
            tiles: [],
         })
      }
      // console.log('coverage_data', coverage_data)
      const can_do = []
      const blank_tiles = []
      const interior_tiles = []
      const needs_update = []
      all_tiles.forEach(tile => {
         const short_code = tile.short_code
         if (FractoTileCoverage.needs_update[short_code.length][short_code]) {
            needs_update.push(short_code)
         }

         const short_code_0 = `${short_code}0`
         const short_code_1 = `${short_code}1`
         const short_code_2 = `${short_code}2`
         const short_code_3 = `${short_code}3`
         const level = short_code.length + 1

         if (FractoTileCoverage.blank_tiles[level][short_code_0]) {
            blank_tiles.push(short_code_0)
         } else if (FractoTileCoverage.interior_tiles[level][short_code_0]) {
            interior_tiles.push(short_code_0)
         } else if (!FractoTileCoverage.indexed_tiles[level][short_code_0]) {
            can_do.push(short_code_0)
         }

         if (FractoTileCoverage.blank_tiles[level][short_code_1]) {
            blank_tiles.push(short_code_1)
         } else if (FractoTileCoverage.interior_tiles[level][short_code_1]) {
            interior_tiles.push(short_code_1)
         } else if (!FractoTileCoverage.indexed_tiles[level][short_code_1]) {
            can_do.push(short_code_1)
         }

         if (FractoTileCoverage.blank_tiles[level][short_code_2]) {
            blank_tiles.push(short_code_2)
         } else if (FractoTileCoverage.interior_tiles[level][short_code_2]) {
            interior_tiles.push(short_code_2)
         } else if (!FractoTileCoverage.indexed_tiles[level][short_code_2]) {
            can_do.push(short_code_2)
         }

         if (FractoTileCoverage.blank_tiles[level][short_code_3]) {
            blank_tiles.push(short_code_3)
         } else if (FractoTileCoverage.interior_tiles[level][short_code_3]) {
            interior_tiles.push(short_code_3)
         } else if (!FractoTileCoverage.indexed_tiles[level][short_code_3]) {
            can_do.push(short_code_3)
         }
      })
      coverage_data.forEach(data => {
         const filtered_by_level = can_do
            .filter(cd => cd.length === data.level)
            .map(short_code => {
               return {
                  short_code,
                  bounds: FractoUtil.bounds_from_short_code(short_code)
               }
            })
         const blanks_by_level = blank_tiles
            .filter(short_code => short_code.length === data.level)
         // console.log("level, blanks_by_level", data.level, blanks_by_level)
         const interiors_by_level = interior_tiles
            .filter(short_code => short_code.length === data.level)
         const needs_update_by_level = needs_update
            .filter(short_code => short_code.length === data.level)
         const interiors_with_bounds = interiors_by_level
            .filter(cd => cd.length === data.level)
            .map(short_code => {
               return {
                  short_code,
                  bounds: FractoUtil.bounds_from_short_code(short_code)
               }
            })
         const needs_update_with_bounds = needs_update_by_level
            .filter(cd => cd.length === data.level)
            .map(short_code => {
               return {
                  short_code,
                  bounds: FractoUtil.bounds_from_short_code(short_code)
               }
            })
         // console.log("level, blanks_by_level", data.level, blanks_by_level)
         data.can_do = filtered_by_level.length ? <LinkedCell
            onClick={e => this.set_enhanced(filtered_by_level, data.level)}>
            <CoolStyles.LinkSpan>{filtered_by_level.length}</CoolStyles.LinkSpan>
         </LinkedCell> : '-'
         data.blank_tiles = blanks_by_level.length ? blanks_by_level.length : '-'
         data.interior_tiles = interiors_with_bounds.length
            ? <LinkedCell
               onClick={e => this.set_enhanced(interiors_with_bounds, data.level)}>
               <CoolStyles.LinkSpan>{interiors_with_bounds.length}</CoolStyles.LinkSpan>
            </LinkedCell>
            : '-'
         data.needs_update_tiles = needs_update_with_bounds.length
            ? <LinkedCell
               onClick={e => this.set_can_repair(needs_update_with_bounds, data.level)}>
               <CoolStyles.LinkSpan>{needs_update_with_bounds.length}</CoolStyles.LinkSpan>
            </LinkedCell>
            : '-'
         data.tile_count = data.tiles.length ? <LinkedCell
            onClick={e => this.set_can_repair(data.tiles, data.level)}>
            <CoolStyles.LinkSpan>{data.tiles.length}</CoolStyles.LinkSpan>
         </LinkedCell> : '-'
      })
      const selected_row = selected_level
         ? coverage_data.findIndex(data => data.level === selected_level)
         : -1
      return <CoolStyles.InlineBlock>
         <CoolTable
            options={TABLE_CAN_SELECT}
            data={coverage_data}
            columns={COVERAGE_TABLE_COLUMNS}
            on_select_row={row => this.on_select_row(coverage_data[row])}
            selected_row={selected_row}
         />
      </CoolStyles.InlineBlock>
   }

   render() {
      const {loading_blanks, loading_indexed, loading_interiors, loading_needs_update} = this.state
      if (loading_blanks || loading_indexed || loading_interiors || loading_needs_update) {
         return "loading short codes..."
      }
      const coverage = this.render_coverage()
      return <SectionWrapper>{coverage}</SectionWrapper>
   }
}

export default FractoTileCoverage;
