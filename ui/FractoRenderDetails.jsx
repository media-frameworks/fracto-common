import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import {render_coordinates} from "fracto/common/FractoStyles";
import {get_tiles} from 'fracto/common/render/FractoRasterImage';

import {INSPECTOR_SIZE_PX} from "pages/constants";

const LABEL_WIDTH_PX = 100
const MAX_LEVEL = 32

const DetailRow = styled(CoolStyles.Block)`
    margin: 0;
`;

const DetailLabel = styled(CoolStyles.InlineBlock)`
    ${CoolStyles.align_right}
    ${CoolStyles.italic}
    ${CoolStyles.bold}
    ${CoolStyles.align_top}
    width: ${LABEL_WIDTH_PX}px;
    margin-right: 0.5rem;
    color: #aaaaaa;
    line-height: 1rem;
    margin-top: 0.25rem;
`;

const DetailData = styled(CoolStyles.InlineBlock)`
    ${CoolStyles.align_middle}
    margin: 0.25rem;
    line-height: 1rem;
`;

const NumberValue = styled(CoolStyles.InlineBlock)`
    ${CoolStyles.deep_blue_text}
    ${CoolStyles.monospace}
    ${CoolStyles.bold}
    font-size: 0.95rem;
`;

export class FractoRenderDetails extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      canvas_buffer: PropTypes.array.isRequired,
      focal_point: PropTypes.object.isRequired,
      scope: PropTypes.number.isRequired,
      cursor_point: PropTypes.object,
   }

   render_focal_point = () => {
      const {focal_point} = this.props
      return render_coordinates(focal_point.x, focal_point.y)
   }

   render_cursor = () => {
      const {cursor_point} = this.props
      if (!cursor_point) {
         return '-'
      }
      return render_coordinates(cursor_point.x, cursor_point.y)
   }

   render_scope = () => {
      const {scope} = this.props
      return <NumberValue>{scope}</NumberValue>
   }

   get_ideal_level = () => {
      const {width_px, scope} = this.props
      const ideal_tiles_across = Math.ceil(2 * width_px / 256);
      const ideal_tile_scope = scope / ideal_tiles_across;
      let ideal_level = -1;
      for (let i = 2; i <= MAX_LEVEL; i++) {
         const level_scope = Math.pow(2, 2 - i)
         if (level_scope < ideal_tile_scope) {
            ideal_level = i;
            break;
         }
      }
      if (ideal_level < 2) {
         ideal_level = 2;
      }
      console.log('ideal_level', ideal_level)
      return ideal_level;
   }

   render_tiles = () => {
      const {scope, focal_point} = this.props
      const coverage_data = get_tiles(
         INSPECTOR_SIZE_PX, focal_point, scope, 1.0, true)
      // console.log('coverage_data', coverage_data)
      const coverage_str = coverage_data
         .sort((a, b) => b.level - a.level)
         .slice(0, 8)
         .map((item) => {
            return `${item.level}:${item.level_tiles.length}`
         }).join(', ')
      return <NumberValue>{coverage_str}</NumberValue>
   }

   render() {
      const {width_px} = this.props
      return [
         {label: "scope", render: this.render_scope},
         {label: "centered at", render: this.render_focal_point},
         {label: "coverage", render: this.render_tiles},
         {label: "cursor", render: this.render_cursor},
      ].map((detail, i) => {
         const data_width_px = width_px - LABEL_WIDTH_PX - 25
         return <DetailRow key={`detail-${i}`}>
            <DetailLabel>{detail.label}</DetailLabel>
            <DetailData style={{width: `${data_width_px}px`}}>{detail.render()}</DetailData>
         </DetailRow>
      })
   }
}

export default FractoRenderDetails
