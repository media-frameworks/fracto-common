import React, {Component} from 'react';
import styled from "styled-components";
import PropTypes from "prop-types";

import LinearProgress from '@mui/material/LinearProgress';
import {Buffer} from 'buffer';

import network from "common/config/network.json";
import CoolStyles from "common/ui/CoolStyles";
import FractoIndexedTiles from "./FractoIndexedTiles";

const TILE_SERVER_BASE = network.tile_server_url;
const TIMEOUT_MS = 100

const ProgressWrapper = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   width: 20rem;
   margin: 0.5rem auto;
`

export class FractoTilesLoaderProgress extends Component {

   static propTypes = {
      set_name: PropTypes.string.isRequired,
      on_complete: PropTypes.func.isRequired,
   }

   state = {
      packet_manifest: null,
      packet_index: 0
   }

   componentDidMount() {
      const {set_name} = this.props
      const url = `${TILE_SERVER_BASE}/tile_index?filename=/${set_name}/packet_manifest.json`
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

   load_packet = (packet_index) => {
      const {packet_manifest} = this.state
      const {set_name, on_complete} = this.props

      if (packet_index >= packet_manifest.packet_files.length) {
         const complete_message = `${set_name} tile index loaded`
         console.log(complete_message)
         on_complete(complete_message)
         return;
      }
      this.setState({packet_index: packet_index})
      const url = `${TILE_SERVER_BASE}/tile_index?filename=/${set_name}/${packet_manifest.packet_files[packet_index]}`
      fetch(url)
         .then(response => response.json())
         .then(json => {
            const packetStr = Buffer.from(json).toString()
            const packet_data = JSON.parse(packetStr)
            FractoIndexedTiles.integrate_tile_packet(set_name, packet_data)
            setTimeout(() => {
               this.load_packet(packet_index + 1)
            }, TIMEOUT_MS)
         })
   }

   render() {
      const {packet_index, packet_manifest} = this.state 
      let indexing_message = 'loading packet data...'
      let progress = []
      if (packet_manifest) {
         const percent = Math.round(100 * packet_index / packet_manifest.packet_files.length)
         indexing_message = `indexing ${packet_manifest.tile_count} tiles, ${percent}% complete`
         progress = <ProgressWrapper>
            <LinearProgress variant="determinate" value={percent}/>
         </ProgressWrapper>
      }
      return [indexing_message, progress]
   }
}

export default FractoTilesLoaderProgress
