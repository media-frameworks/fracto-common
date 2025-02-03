import {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

import {CoolStyles, CoolTable} from 'common/ui/CoolImports';
import {
   CELL_ALIGN_CENTER,
   CELL_TYPE_NUMBER,
   CELL_TYPE_TEXT, CELL_TYPE_TIME_AGO
} from "common/ui/CoolTable";

TimeAgo.locale(en)

const ShortCodeSpan = styled.span`
   ${CoolStyles.monospace}
`
const MessageSpan = styled.span`
   ${CoolStyles.italic}
   font-size: 0.85rem;
   color: #666666;
`
const SmallSpacer = styled(CoolStyles.InlineBlock)`
   width: 0.25rem;
`

const HISTORY_HEADERS = [
   {
      id: "index",
      label: "#",
      type: CELL_TYPE_NUMBER,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "short_code",
      label: "short code",
      type: CELL_TYPE_TEXT,
      width_px: 180,
   },
   {
      id: "result",
      label: "result",
      type: CELL_TYPE_TEXT,
      width_px: 600,
   },
]

export class FractoTileRunHistory extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      history_items: PropTypes.array.isRequired,
   }

   static format_history_item = (tile, operation, message, tile_index) => {
      return {
         tile: tile,
         operation: operation,
         message: message,
         timestamp: new Date(),
         tile_index: tile_index
      }
   }

   diff_times = (timestamp1, timestamp2) =>{
      var date1 = new Date(timestamp1);
      var date2 = new Date(timestamp2);

      var msec = date2.getTime() - date1.getTime();
      var hh = Math.floor(msec / 1000 / 60 / 60);
      msec -= hh * 1000 * 60 * 60;
      var mm = Math.floor(msec / 1000 / 60);
      msec -= mm * 1000 * 60;
      var ss = Math.floor(msec / 1000);

      return `${hh < 10 ? '0' : ''}${hh}:${mm < 10 ? '0' : ''}${mm}:${ss < 10 ? '0' : ''}${ss}`
   }

   render() {
      const {history_items} = this.props
      // console.log("history_items", history_items)
      let previous_ts = 0
      const history_data = history_items.sort((a, b) => {
         return b.timestamp - a.timestamp
      }).map((item, i) => {
         const short_code = item.tile ? <ShortCodeSpan>{item.tile.short_code}</ShortCodeSpan> : '?'
         const time_ago =<ReactTimeAgo date={item.timestamp}/>
         const message = <MessageSpan
            title={item.message}>
            {[`${item.message},`, <SmallSpacer />, time_ago]}
         </MessageSpan>
         const result = {
            index: item.tile_index,
            timestamp: item.timestamp,
            short_code: short_code,
            result: message,
            elapsed: i === history_items.length - 1 || i === 0 ? '-' : this.diff_times(item.timestamp, previous_ts)
         }
         previous_ts = item.timestamp
         return result
      })
      return [
         <CoolTable
            data={history_data}
            columns={HISTORY_HEADERS}
         />
      ]
   }
}

export default FractoTileRunHistory
