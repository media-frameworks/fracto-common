import {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from 'common/ui/CoolImports';

import FractoTileRender from './FractoTileRender';
import FractoTileContext from './FractoTileContext';
import FractoTileNavigate from './FractoTileNavigate';
import FractoUtil from "../FractoUtil";

export const CONTEXT_SIZE_PX = 350;
export const TILE_SIZE_PX = 550;

const AUTOMATE_TIMEOUT_MS = 2500;

const ContextWrapper = styled(CoolStyles.InlineBlock)`
   margin-right: 10px;
`;

const RenderWrapper = styled(CoolStyles.InlineBlock)`
   margin-right: 10px;
   margin-bottom: 10px;
`;

const NavigationArapper = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   margin-top: 0.5rem;
`;

export class FractoTileAutomate extends Component {

   static propTypes = {
      all_tiles: PropTypes.array.isRequired,
      level: PropTypes.number.isRequired,
      tile_action: PropTypes.func.isRequired,
      on_tile_select: PropTypes.func.isRequired,
      no_tile_mode: PropTypes.bool,
   }

   static defaultProps = {
      no_tile_mode: false
   }

   state = {
      tile_index: 0,
      automate: false,
   };

   act_on_tile = (tile_index) => {
      const {automate} = this.state;
      const {tile_action} = this.props;
      this.setState({tile_index: tile_index})
      const tile = this.get_active_tile(tile_index)
      tile_action(tile, result => {
         if (automate) {
            setTimeout(() => {
               this.act_on_tile(tile_index + 1)
            }, AUTOMATE_TIMEOUT_MS)
         }
      })
   }

   on_automate = (automate) => {
      const {tile_index} = this.state;
      this.setState({automate: automate});
      if (automate) {
         setTimeout(() => this.act_on_tile(tile_index), AUTOMATE_TIMEOUT_MS)
      }
   }

   get_active_tile = (tile_index) => {
      const {all_tiles} = this.props
      if (tile_index >= all_tiles.length) {
         return "tile index out of range"
      }
      const tile = all_tiles[tile_index]
      if (!tile.short_code) {
         return "bad tile"
      }
      const tile_bounds = FractoUtil.bounds_from_short_code(tile.short_code)
      return {
         short_code: tile.short_code,
         bounds: tile_bounds
      };
   }

   on_index_change = (new_index) => {
      const {on_tile_select} = this.props
      this.setState({tile_index: new_index})
      const tile = this.get_active_tile(new_index)
      on_tile_select(tile)
   }

   render() {
      const {tile_index, automate} = this.state;
      const {all_tiles, level,no_tile_mode} = this.props
      if (!all_tiles.length) {
         return "no tiles"
      }
      const tile = this.get_active_tile(tile_index)
      return [
         <ContextWrapper
            key={`ContextWrapper_${tile.short_code}`}>
            <FractoTileContext
               tile={tile}
               level={level}
               width_px={CONTEXT_SIZE_PX}
            />
         </ContextWrapper>,
         <RenderWrapper
            key={`RenderWrapper_${tile.short_code}`}>
            <FractoTileRender
               tile={tile}
               width_px={TILE_SIZE_PX}
               no_tile_mode={no_tile_mode}
            />
         </RenderWrapper>,
         <NavigationArapper
            key={`NavigationArapper_${tile.short_code}`}>
            <FractoTileNavigate
               level_tiles={all_tiles}
               tile_index={tile_index}
               automate={automate}
               on_index_change={new_index => this.on_index_change(new_index)}
               on_automate={automate => this.on_automate(automate)}
            />
         </NavigationArapper>
      ]

   }
}

export default FractoTileAutomate;
