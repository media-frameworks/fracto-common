import React, {Component} from 'react';
import styled from "styled-components";
import PropTypes from "prop-types";

import LinearProgress from '@mui/material/LinearProgress';

import FractoCommon from "../FractoCommon";
import FractoIndexedTiles from "./FractoIndexedTiles";
import {BIN_VERB_INDEXED} from "./FractoData";
import CoolStyles from "common/ui/CoolStyles";
import CoolColors from "common/ui/CoolColors";

const BATCH_SIZE = 50000
const TIMEOUT_MS = 10

const ProgressWrapper = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   width: 20rem;
   margin: 0.5rem auto;
`
const IndexingSpan = styled.span`
   ${CoolStyles.monospace}
   color: ${CoolColors.light_cool_blue}
   font-size: 0.75rem;
`;

const ReadingManifestSpan = styled.span`
   ${CoolStyles.monospace}
   color: #888888;
   font-size: 1rem;
`;

const TitleBar = styled(CoolStyles.Block)`
   ${CoolStyles.uppercase}
   ${CoolStyles.align_center}
   ${CoolStyles.narrow_text_shadow}
   font-size: 1.25rem;
   margin: 1rem auto;
   letter-spacing: 1.5rem;
   color: #999999;
   padding-left: 2rem;
   padding-right: 1rem;
   text-shadow: 0.125rem 0.125rem 0.5rem rgba(0,0,0,0.25);
`;

export class FractoIndexedTilesLoader extends Component {

   static propTypes = {
      app_name: PropTypes.string.isRequired,
      app_page: PropTypes.array.isRequired,
   }

   state = {
      short_codes: [],
      load_index: 0,
      load_complete: false
   }

   componentDidMount() {
      FractoIndexedTiles.load_short_codes(BIN_VERB_INDEXED, result => {
         this.setState({short_codes: result})
         setTimeout(() => {
            this.load_batch(0)
         }, TIMEOUT_MS)
      })
   }

   load_batch = (index) => {
      const {short_codes} = this.state
      if (index > short_codes.length) {
         this.setState({load_complete: true})
         return;
      }
      const batch_list = short_codes.slice(index, index + BATCH_SIZE)
      FractoIndexedTiles.index_tiles(batch_list)
      this.setState({load_index: index})
      setTimeout(() => {
         this.load_batch(index + BATCH_SIZE)
      }, TIMEOUT_MS)
   }

   render() {
      const {short_codes, load_index, load_complete} = this.state
      const {app_page, app_name} = this.props
      const title_bar = <TitleBar>{app_name}</TitleBar>
      const percent = Math.round(100 * load_index / (short_codes.length + 1))
      const indexing_message = `indexing ${short_codes.length} tiles, ${percent}% complete`
      const prompt = short_codes.length
         ? <IndexingSpan>{indexing_message}</IndexingSpan>
         : <ReadingManifestSpan>{`loading tile list...`}</ReadingManifestSpan>
      const progress = <ProgressWrapper>
         <LinearProgress variant="determinate" value={percent}/>
      </ProgressWrapper>
      const extra = [
         title_bar,
         prompt,
         short_codes.length ? progress : []
      ]
      return load_complete
         ? app_page
         : FractoCommon.loading_wait_notice(extra)
   }
}

export default FractoIndexedTilesLoader
