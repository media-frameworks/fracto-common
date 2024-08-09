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
      load_levels: PropTypes.array,
   }

   state = {
      packet_files: null,
      packet_index: 0,
      loading_level: 0,
      tile_count: 0,
   }

   componentDidMount() {
      const {set_name, on_complete} = this.props
      if (FractoIndexedTiles.tile_set_is_loaded(set_name)) {
         const message = `"${set_name}" tiles already loaded`
         console.log(message)
         on_complete(message)
         return
      }
      const url = `${TILE_SERVER_BASE}/tile_index?filename=/${set_name}/packet_manifest.json`
      fetch(url)
         .then(response => response.json())
         .then(json => {
            const manifestStr = Buffer.from(json).toString()
            const manifest = JSON.parse(manifestStr)
            // console.log('manifest.json', manifest)
            this.setState({
               packet_files: manifest.packet_files,
               tile_count: manifest.tile_count
            })
            setTimeout(() => {
               this.load_packet(0)
            }, TIMEOUT_MS)
         })
   }

   load_packet = (packet_index) => {
      const {packet_files} = this.state
      const {set_name, on_complete} = this.props

      if (packet_index >= packet_files.length) {
         const complete_message = `${set_name} tile index loaded`
         console.log(complete_message)
         on_complete(complete_message)
         return;
      }
      this.setState({packet_index: packet_index})
      const url = `${TILE_SERVER_BASE}/tile_index?filename=/${set_name}/${packet_files[packet_index]}`
      fetch(url)
         .then(response => response.json())
         .then(json => {
            const packetStr = Buffer.from(json).toString()
            const packet_data = JSON.parse(packetStr)
            const level = packet_data.level
            this.setState({loading_level: level})
            FractoIndexedTiles.integrate_tile_packet(set_name, packet_data)
            setTimeout(() => {
               this.load_packet(packet_index + 1)
            }, TIMEOUT_MS)
         })
   }

   render() {
      const {packet_index, packet_files, loading_level, tile_count} = this.state
      let indexing_message = 'loading packet data...'
      let tile_count_message = ''
      let progress = []
      if (packet_files) {
         const percent = Math.round(100 * packet_index / packet_files.length)
         indexing_message = `indexing level ${loading_level} tiles, ${percent}% complete`
         progress = <ProgressWrapper>
            <LinearProgress variant="determinate" value={percent}/>
         </ProgressWrapper>
         tile_count_message = `${tile_count} tiles total`
      }
      return [indexing_message, progress, tile_count_message]
   }
}

export default FractoTilesLoaderProgress
