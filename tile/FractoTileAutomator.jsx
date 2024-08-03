import {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

import {CoolStyles} from 'common/ui/CoolImports';
import FractoCommon from 'fracto/common/FractoCommon';

import FractoTileAutomate, {CONTEXT_SIZE_PX} from 'fracto/common/tile/FractoTileAutomate';
import FractoTileDetails from 'fracto/common/tile/FractoTileDetails';

TimeAgo.locale(en)

const WRAPPER_MARGIN_PX = 10

const FieldWrapper = styled(CoolStyles.Block)`
   margin: ${WRAPPER_MARGIN_PX}px;
`;

const AutomateWrapper = styled(CoolStyles.InlineBlock)`
   width: ${CONTEXT_SIZE_PX + CONTEXT_SIZE_PX + 20}px;
`;

const RecentResult = styled(CoolStyles.Block)`
   margin-bottom: 0.25rem;
`;

const DetailsWrapper = styled(CoolStyles.InlineBlock)`
   margin: 0;
`;

const SummaryWrapper = styled(CoolStyles.Block)`
   margin-left: 1rem;
`;

const ResultsWrapper = styled(CoolStyles.Block)`
   margin-left: 1rem;
   border: 1px solid black;
   border-radius: 0.25rem;
   height: 20rem;
   overflow-y: auto;
   padding: 0.5rem;
`;

export class FractoTileAutomator extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
      descriptor: PropTypes.string.isRequired,
      all_tiles: PropTypes.array.isRequired,
      tile_action: PropTypes.func.isRequired,
      no_tile_mode: PropTypes.bool,
      on_render_tile: PropTypes.func,
      summary_text: PropTypes.string,
      on_render_detail: PropTypes.func,
      on_select_tile: PropTypes.func,
      auto_refresh: PropTypes.number,
      on_automate: PropTypes.func,
      on_context_rendered: PropTypes.func,
   }

   static defaultProps = {
      no_tile_mode: false,
      on_render_tile: null,
      summary_text: null,
      on_render_detail: null,
      on_select_tile: null,
      auto_refresh: 0,
   }

   state = {
      completed_loading: false,
      indexed_loading: false,
      tile_index: 0,
      run_history: [],
      tile_details: [],
      run_start: null,
      run_tile_index_start: 0
   };

   componentDidMount() {
      this.initalize_tile_sets()
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      if (prevProps.level !== this.props.level) {
         this.initalize_tile_sets()
      }
   }

   initalize_tile_sets = () => {
      const {level, descriptor, all_tiles, on_select_tile} = this.props;
      const level_key = `${descriptor}_tile_index_${level}`
      let tile_index_str = localStorage.getItem(level_key)
      if (!tile_index_str || parseInt(tile_index_str) > all_tiles.length) {
         tile_index_str = '0'
      }
      const tile_index = parseInt(tile_index_str)
      this.setState({
         tile_index: tile_index
      });
      if (on_select_tile) {
         on_select_tile(all_tiles[tile_index])
      }
      // FractoDataLoader.load_tile_set_async(BIN_VERB_COMPLETED, result => {
      //    console.log("FractoDataLoader.load_tile_set_async", BIN_VERB_COMPLETED, result)
      //    this.setState({completed_loading: false});
      // });
      // FractoDataLoader.load_tile_set_async(BIN_VERB_INDEXED, result => {
      //    console.log("FractoDataLoader.load_tile_set_async", BIN_VERB_INDEXED, result)
      //    this.setState({indexed_loading: false});
      // });
   }

   on_tile_select = (tile_index, cb) => {
      const {level, descriptor, all_tiles, on_select_tile} = this.props;
      this.setState({tile_index: tile_index < all_tiles.length ? tile_index : 0})
      const level_key = `${descriptor}_tile_index_${level}`
      localStorage.setItem(level_key, `${tile_index}`)
      if (on_select_tile) {
         on_select_tile(all_tiles[tile_index], result => {
            if (cb) {
               cb(result)
            }
         })
      }
   }

   on_tile_action = (tile, cb) => {
      const {run_history, tile_index} = this.state
      // console.log("on_tile_action", tile_index)
      const {tile_action} = this.props;
      if (!tile_action) {
         const message = "no action"
         run_history.push({
            tile_index: tile_index,
            response: message,
            timestamp: new Date()
         })
         this.setState({run_history: run_history})
         cb(message)
      } else {
         tile_action(tile, message => {
            run_history.push({
               tile_index: tile_index,
               response: message,
               timestamp: new Date()
            })
            this.setState({run_history: run_history})
            cb(message)
         })
      }
   }

   render_tab_details = () => {
      return []
   }

   render_run_history = () => {
      const {run_history, tile_index, run_tile_index_start, run_start} = this.state;
      const {summary_text} = this.props
      const recent_results = run_history.sort((a, b) => b.tile_index - a.tile_index)
         .map(result => {
            const result_line = [
               `${result.tile_index + 1}: ${result.response} (`,
               <ReactTimeAgo date={result.timestamp}/>,
               `)`
            ]
            return <RecentResult key={`recent-result-${result.tile_index}`}>
               {result_line}
            </RecentResult>
         })
      const summary = !summary_text ? '' : `, ${summary_text}`
      const timer_now = performance.now()
      const tiles_per_minute = 60 * 1000 * (tile_index - run_tile_index_start) / (timer_now - run_start)
      const rounded_tiles_per_minute = Math.round(100 * tiles_per_minute) / 100
      return [
         <SummaryWrapper>{!recent_results.length ? '' : `${recent_results.length} results this run${summary} (${rounded_tiles_per_minute} tiles/min)`}</SummaryWrapper>,
         <ResultsWrapper>{recent_results}</ResultsWrapper>
      ]
   }

   on_automate = (automate) => {
      const {tile_index} = this.state
      const {on_automate} = this.props
      if (automate) {
         console.log("starting run timer")
         const run_start = performance.now()
         this.setState({
            run_start: run_start,
            run_tile_index_start: tile_index
         })
         if (on_automate) {
            on_automate(automate)
         }
      }
   }

   render() {
      const {tile_index, indexed_loading, completed_loading, run_history} = this.state;
      const {
         level, width_px, all_tiles, no_tile_mode,
         on_render_tile, on_render_detail, auto_refresh, on_context_rendered
      } = this.props;
      if (indexed_loading || completed_loading) {
         return FractoCommon.loading_wait_notice("FractoTileAutomator")
      }
      // if (!all_tiles.length) {
      //    return "no tiles 2"
      // }
      if (tile_index < 0 || tile_index > all_tiles.length) {
         return `bad tile index: ${tile_index}`
      }
      const active_tile = all_tiles[tile_index]
      const details_width_px = width_px - (CONTEXT_SIZE_PX + CONTEXT_SIZE_PX) - 60 - 2 * WRAPPER_MARGIN_PX
      const all_details = [
         on_render_detail ? on_render_detail(active_tile, details_width_px) : '',
         run_history.length ? this.render_run_history() : ''
      ]
      return <FieldWrapper>
         <AutomateWrapper>
            <FractoTileAutomate
               all_tiles={all_tiles}
               tile_index={tile_index}
               level={level - 1}
               tile_action={this.on_tile_action}
               on_tile_select={this.on_tile_select}
               no_tile_mode={no_tile_mode}
               tile_size_px={CONTEXT_SIZE_PX}
               on_render_tile={on_render_tile}
               on_context_rendered={on_context_rendered}
               auto_refresh={auto_refresh}
               on_automate={this.on_automate}
            />
         </AutomateWrapper>
         <DetailsWrapper>
            <FractoTileDetails
               active_tile={active_tile}
               width_px={details_width_px}
            />
            {all_details}
         </DetailsWrapper>
      </FieldWrapper>
   }
}

export default FractoTileAutomator;
