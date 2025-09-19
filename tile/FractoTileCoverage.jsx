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
   {
      id: "can_detail_tiles",
      label: "can detail",
      type: CELL_TYPE_NUMBER,
      width_px: 60,
      align: CELL_ALIGN_CENTER
   },
]

const MAX_LEVELS = 30; // Limit the number of levels processed
const MAX_TILES_PER_LEVEL = 250000; // Limit tiles per level to avoid memory issues

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
      coverage: [],
      render_details: false,
   }

   static indexed_tiles = []
   static blank_tiles = []
   static interior_tiles = []
   static needs_update = []

   componentDidMount() {
      this.collect_category_tiles('indexed', result => {
         FractoTileCoverage.indexed_tiles = result;
         this.setState({loading_indexed: false})
      })
      this.collect_category_tiles('blank', result => {
         FractoTileCoverage.blank_tiles = result;
         this.setState({loading_blanks: false})
      })
      this.collect_category_tiles('interior', result => {
         FractoTileCoverage.interior_tiles = result;
         this.setState({loading_interiors: false})
      })
      this.collect_category_tiles('needs_update', result => {
         FractoTileCoverage.needs_update = result;
         this.setState({loading_needs_update: false})
      })
   }

   collect_category_tiles = (tile_set_name, cb) => {
      const result = []
      for (let level = 0; level < 30; level++) {
         result[level] = new Set()
      }
      FractoIndexedTiles.load_short_codes(tile_set_name, short_codes => {
         short_codes.forEach(short_code => {
            const level = short_code.length
            if (!result[level]) {
               return;
            }
            result[level].add(short_code)
         })
         cb(result)
      })
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
      const {focal_point, scope} = this.props;
      const tiles_in_scope = [];
      const ideal_level = get_ideal_level(INSPECTOR_SIZE_PX, scope, 1.5);
      const max_levels = Math.min(MAX_LEVELS, ideal_level + 10); // Only process a few levels

      for (let level = 2; level < max_levels; level++) {
         const level_tiles = FractoIndexedTiles.tiles_in_scope(level, focal_point, scope);
         if (level_tiles.length > MAX_TILES_PER_LEVEL) {
            // Limit the number of tiles per level
            level_tiles.length = MAX_TILES_PER_LEVEL;
         }
         console.log('level_tiles', level, level_tiles)
         tiles_in_scope.push({
            level: level,
            tiles: level_tiles
         });
      }
      const filtered_tiles_in_scope = tiles_in_scope.filter(scoped => scoped.tiles.length > 1);
      const coverage = this.render_coverage(filtered_tiles_in_scope);
      this.setState({
         coverage,
         tiles_in_scope: filtered_tiles_in_scope
      });
   }

   set_enhanced = (enhance_tiles, level) => {
      const {on_tile_set_changed} = this.props
      this.setState({render_details: false})
      on_tile_set_changed(enhance_tiles, level, false, false)
   }

   set_can_repair = (repair_tiles, level) => {
      const {on_tile_set_changed} = this.props
      this.setState({render_details: false})
      on_tile_set_changed(repair_tiles, level, true, false)
   }

   set_can_detail = (detail_tiles, level) => {
      const {on_tile_set_changed} = this.props
      this.setState({render_details: true})
      on_tile_set_changed(detail_tiles, level, false, true)
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

   render_coverage = (tiles_in_scope) => {
      const {selected_level} = this.props;
      let all_tiles = [];
      const coverage_data = tiles_in_scope.map(scoped => {
         all_tiles = all_tiles.concat(scoped.tiles);
         return {
            level: scoped.level,
            tile_count: scoped.tiles.length,
            tiles: scoped.tiles,
         };
      });
      if (tiles_in_scope.length) {
         coverage_data.push({
            level: tiles_in_scope[tiles_in_scope.length - 1].level + 1,
            tile_count: 0,
            tiles: [],
         });
      }
      // Use Sets for faster lookups and to avoid duplicates
      const can_do = new Set();
      const blank_tiles = new Set();
      const interior_tiles = new Set();
      const needs_update = new Set();
      all_tiles.forEach(tile => {
         const short_code = tile.short_code;
         const level = short_code.length
         const in_update = FractoTileCoverage.needs_update[level].has(short_code);
         if (in_update) {
            needs_update.add(short_code);
         }
         const new_level = short_code.length + 1;
         for (let i = 0; i < 4; i++) {
            const sc = `${short_code}${i}`;
            const in_blank = FractoTileCoverage.blank_tiles[new_level].has(sc);
            if (in_blank) {
               blank_tiles.add(sc);
            } else {
               const in_interior = FractoTileCoverage.interior_tiles[new_level].has(sc);
               if (in_interior) {
                  interior_tiles.add(sc);
               } else {
                  const in_indexed = FractoTileCoverage.indexed_tiles[new_level].has(sc);
                  if (!in_indexed) {
                     can_do.add(sc);
                  }
               }
            }
         }
      });
      coverage_data.forEach(data => {
         const filtered_by_level = Array.from(can_do).filter(cd => cd.length === data.level).map(short_code => ({
            short_code,
            bounds: FractoUtil.bounds_from_short_code(short_code)
         }));
         const blanks_by_level = Array.from(blank_tiles).filter(short_code => short_code.length === data.level);
         const interiors_by_level = Array.from(interior_tiles).filter(short_code => short_code.length === data.level);
         const needs_update_by_level = Array.from(needs_update).filter(short_code => short_code.length === data.level);
         const interiors_with_bounds = interiors_by_level.map(short_code => ({
            short_code,
            bounds: FractoUtil.bounds_from_short_code(short_code)
         }));
         const needs_update_with_bounds = needs_update_by_level.map(short_code => ({
            short_code,
            bounds: FractoUtil.bounds_from_short_code(short_code)
         }));
         data.can_do = filtered_by_level.length ? <LinkedCell
            onClick={e => this.set_enhanced(filtered_by_level, data.level)}>
            <CoolStyles.LinkSpan>{filtered_by_level.length}</CoolStyles.LinkSpan>
         </LinkedCell> : '-';
         data.blank_tiles = blanks_by_level.length ? blanks_by_level.length : '-';
         data.interior_tiles = interiors_with_bounds.length
            ? <LinkedCell
               onClick={e => this.set_enhanced(interiors_with_bounds, data.level)}>
               <CoolStyles.LinkSpan>{interiors_with_bounds.length}</CoolStyles.LinkSpan>
            </LinkedCell>
            : '-';
         data.needs_update_tiles = needs_update_with_bounds.length
            ? <LinkedCell
               onClick={e => this.set_can_repair(needs_update_with_bounds, data.level)}>
               <CoolStyles.LinkSpan>{needs_update_with_bounds.length}</CoolStyles.LinkSpan>
            </LinkedCell>
            : '-';
         data.tile_count = data.tiles.length ? <LinkedCell
            onClick={e => this.set_can_repair(data.tiles, data.level)}>
            <CoolStyles.LinkSpan>{data.tiles.length}</CoolStyles.LinkSpan>
         </LinkedCell> : '-';
      });
      const selected_row = selected_level
         ? coverage_data.findIndex(data => data.level === selected_level)
         : -1;
      return <CoolStyles.InlineBlock>
         <CoolTable
            options={TABLE_CAN_SELECT}
            data={coverage_data}
            columns={COVERAGE_TABLE_COLUMNS}
            on_select_row={row => this.on_select_row(coverage_data[row])}
            selected_row={selected_row}
         />
      </CoolStyles.InlineBlock>;
   }

   render() {
      const {
         loading_blanks, loading_indexed, loading_interiors, loading_needs_update,
         coverage
      } = this.state
      if (loading_blanks || loading_indexed || loading_interiors || loading_needs_update) {
         return "loading short codes..."
      }
      return <SectionWrapper>{coverage}</SectionWrapper>
   }
}

export default FractoTileCoverage;
