import {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles, CoolTable} from 'common/ui/CoolImports';
import {
   CELL_ALIGN_CENTER,
   CELL_TYPE_NUMBER,
   CELL_TYPE_TEXT, CELL_TYPE_TIME_AGO
} from "common/ui/CoolTable";
import {render_short_code} from "../FractoStyles";

const ShortCodeSpan = styled.span`
   ${CoolStyles.monospace}
`
const MessageSpan = styled.span`
   ${CoolStyles.italic}
   font-size: 0.85rem;
   color: #666666;
`
const HISTORY_HEADERS = [
   {
      id: "index",
      label: "#",
      type: CELL_TYPE_NUMBER,
      align: CELL_ALIGN_CENTER
   },
   // {
   //    id: "timestamp",
   //    label: "when",
   //    type: CELL_TYPE_TIME_AGO,
   //    width_px: 120
   // },
   // {
   //    id: "elapsed",
   //    label: "elapsed",
   //    type: CELL_TYPE_TEXT,
   //    width_px: 120
   // },
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

   static format_history_item = (tile, operation, message) => {
      return {
         tile: tile,
         operation: operation,
         message: message,
         timestamp: new Date()
      }
   }

   diff_times = (timestamp1, timestamp2) =>{
      var date1 = new Date(timestamp1);
      var date2 = new Date(timestamp2);

      var diff = date2.getTime() - date1.getTime();

      var msec = diff;
      var hh = Math.floor(msec / 1000 / 60 / 60);
      msec -= hh * 1000 * 60 * 60;
      var mm = Math.floor(msec / 1000 / 60);
      msec -= mm * 1000 * 60;
      var ss = Math.floor(msec / 1000);

      return `${hh < 10 ? '0' : ''}${hh}:${mm < 10 ? '0' : ''}${mm}:${ss < 10 ? '0' : ''}${ss}`
   }

   render() {
      const {history_items} = this.props
      console.log("history_items", history_items)
      let previous_ts = 0
      const history_data = history_items.sort((a, b) => {
         return b.timestamp - a.timestamp
      }).map((item, i) => {
         const short_code =item.tile ? <ShortCodeSpan>{item.tile.short_code}</ShortCodeSpan> : '?'
         const message = <MessageSpan title={item.message}>{item.message}</MessageSpan>
         const result = {
            index: history_items.length - i,
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
