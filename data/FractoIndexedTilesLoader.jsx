import React, {Component} from 'react';
import styled from "styled-components";
import PropTypes from "prop-types";

import FractoCommon from "../FractoCommon";
import CoolStyles from "common/ui/styles/CoolStyles";
import FractoTilesLoaderProgress from "./FractoTilesLoaderProgress";
import {TILE_SET_INDEXED} from "./FractoIndexedTiles";

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
      load_complete: false,
   }

   render() {
      const {load_complete} = this.state
      const {app_page, app_name} = this.props
      if (load_complete) {
         console.log(`${load_complete}, running page now`)
         return app_page
      }
      const title_bar = <TitleBar>{app_name}</TitleBar>
      const loader_progress = <FractoTilesLoaderProgress
         set_name={TILE_SET_INDEXED}
         on_complete={message => this.setState({load_complete: message})}
      />
      return FractoCommon.loading_wait_notice([title_bar, loader_progress])
   }
}

export default FractoIndexedTilesLoader
