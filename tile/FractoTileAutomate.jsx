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
const AUTO_REFRESH_FLAG = "auto_refresh_flag"

const AUTOMATE_TIMEOUT_MS = 500;

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
      tile_index: PropTypes.number.isRequired,
      level: PropTypes.number.isRequired,
      tile_action: PropTypes.func.isRequired,
      on_tile_select: PropTypes.func.isRequired,
      no_tile_mode: PropTypes.bool,
      on_render_tile: PropTypes.func,
      on_context_rendered: PropTypes.func,
      tile_size_px: PropTypes.number,
      auto_refresh: PropTypes.number,
      on_automate: PropTypes.func,
   }

   static defaultProps = {
      no_tile_mode: false,
      tile_size_px: TILE_SIZE_PX,
      auto_refresh: 0,
      inland_tiles_only: false
   }

   state = {
      automate: false,
      start_index: 0
   };

   componentDidMount() {
      const is_auto_refresh_str = localStorage.getItem(AUTO_REFRESH_FLAG)
      if (is_auto_refresh_str) {
         const is_auto_refresh = parseInt(is_auto_refresh_str)
         if (is_auto_refresh !== 0) {
            localStorage.setItem(AUTO_REFRESH_FLAG, "0")
            this.on_automate(true)
         }
      }
   }

   act_on_tile = (tile_index) => {
      const {automate, start_index} = this.state;
      const {tile_action, on_tile_select, auto_refresh} = this.props;
      console.log('act_on_tile', tile_index - start_index)
      if (auto_refresh && tile_index - start_index > auto_refresh) {
         localStorage.setItem(AUTO_REFRESH_FLAG, "1")
         window.location = "/"
      }
      const tile = this.get_active_tile(tile_index)
      if (!tile) {
         this.setState({automate: false});
         this.on_automate(false)
         return;
      }
      on_tile_select(tile_index, result0 => {
         console.log(`tile is selected: ${result0}`)
         tile_action(tile, result => {
            if (result === false) {
               this.setState({automate: false})
               this.on_automate(false)
            } else if (automate) {
               this.act_on_tile(tile_index + 1)
            }
         })
      })
   }

   on_automate = (automate) => {
      const {tile_index, on_automate} = this.props;
      this.setState({automate: automate});
      if (on_automate) {
         on_automate(automate)
      }
      if (automate) {
         this.setState({start_index: tile_index})
         setTimeout(() => this.act_on_tile(tile_index), AUTOMATE_TIMEOUT_MS)
      }
   }

   get_active_tile = (tile_index) => {
      const {all_tiles} = this.props
      if (!all_tiles.length) {
         console.log("!all_tiles.length")
         return null
      }
      const tile = all_tiles[tile_index]
      if (!tile) {
         console.log(`!tile, tile_index = ${tile_index} all_tiles.length=${all_tiles.length}`)
         return null
      }
      const tile_bounds = FractoUtil.bounds_from_short_code(tile.short_code)
      return {
         short_code: tile.short_code,
         bounds: tile_bounds
      };
   }

   on_index_change = (new_index) => {
      const {on_tile_select} = this.props
      console.log("on_index_change", new_index)
      const tile = this.get_active_tile(new_index)
      if (tile) {
         on_tile_select(new_index)
      } else {
         this.on_automate(false)
      }
   }

   render() {
      const {automate} = this.state;
      const {tile_index, on_render_tile, tile_size_px, on_context_rendered} = this.props;
      const {all_tiles, level, no_tile_mode} = this.props
      // if (!all_tiles.length) {
      //    return "no tiles 1"
      // }
      const tile = this.get_active_tile(tile_index)
      if (!tile) {
         return "no tile"
      }
      const rendered_tile = on_render_tile ?
         on_render_tile(tile, tile_size_px) :
         <FractoTileRender
            key={`render-tile`}
            tile={tile}
            width_px={tile_size_px}
            no_tile_mode={no_tile_mode}/>
      return [
         <ContextWrapper
            key={`ContextWrapper`}>
            <FractoTileContext
               key={`tile-context`}
               tile={tile}
               level={level}
               on_context_rendered={on_context_rendered}
               width_px={CONTEXT_SIZE_PX}/>
         </ContextWrapper>,
         <RenderWrapper
            key={`RenderWrapper_${tile.short_code}`}>
            {rendered_tile}
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
