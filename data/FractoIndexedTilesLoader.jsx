import React, {Component} from 'react';
import styled from "styled-components";
import PropTypes from "prop-types";

import network from "common/config/network.json";
import LinearProgress from '@mui/material/LinearProgress';
import {Buffer} from 'buffer';

import FractoCommon from "../FractoCommon";
import FractoIndexedTiles from "./FractoIndexedTiles";
import CoolStyles from "common/ui/CoolStyles";

const TILE_SERVER_BASE = network.tile_server_url;
const TIMEOUT_MS = 100

const ProgressWrapper = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   width: 20rem;
   margin: 0.5rem auto;
`

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
      packet_manifest: null,
      packet_index: 0
   }

   componentDidMount() {
      if (!FractoIndexedTiles.tile_index.length) {
         const url = `${TILE_SERVER_BASE}/tile_index?filename=packet_manifest.json`
         fetch(url)
            .then(response => response.json())
            .then(json => {
               const manifestStr = Buffer.from(json).toString()
               const manifest = JSON.parse(manifestStr)
               console.log('manifest.json', manifest)
               this.setState({packet_manifest: manifest})
               setTimeout(() => {
                  this.load_packet(0)
               }, TIMEOUT_MS)
            })
      }
   }

   load_packet = (packet_index) => {
      const {packet_manifest} = this.state
      if (packet_index >= packet_manifest.packet_files.length) {
         this.setState({load_complete: true})
         console.log('load is complete')
         return;
      }
      this.setState({packet_index: packet_index})
      const url = `${TILE_SERVER_BASE}/tile_index?filename=${packet_manifest.packet_files[packet_index]}`
      fetch(url)
         .then(response => response.json())
         .then(json => {
            const packetStr = Buffer.from(json).toString()
            const packet = JSON.parse(packetStr)
            const level = packet.level
            let level_bin = FractoIndexedTiles.tile_index
               .find(bin => bin.level === level)
            if (!level_bin) {
               level_bin = {
                  level: level,
                  tile_size: Math.pow(2, 2 - level),
                  columns: []
               }
               FractoIndexedTiles.tile_index.push(level_bin)
            }
            level_bin.columns = level_bin.columns.concat(packet.columns)
            setTimeout(() => {
               this.load_packet(packet_index + 1)
            }, TIMEOUT_MS)
         })
   }

   render() {
      const {load_complete, packet_manifest, packet_index} = this.state
      const {app_page, app_name} = this.props
      if (load_complete) {
         console.log('load is complete, running page now')
         return app_page
      }
      const title_bar = <TitleBar>{app_name}</TitleBar>
      let indexing_message = 'loading packet data...'
      let progress = []
      if (packet_manifest) {
         const percent = Math.round(100 * packet_index / packet_manifest.packet_files.length)
         indexing_message = `indexing ${packet_manifest.tile_count} tiles, ${percent}% complete`
         progress = <ProgressWrapper>
            <LinearProgress variant="determinate" value={percent}/>
         </ProgressWrapper>
      }
      const extra = [
         title_bar,
         indexing_message,
         progress
      ]
      return FractoCommon.loading_wait_notice(extra)
   }
}

export default FractoIndexedTilesLoader
