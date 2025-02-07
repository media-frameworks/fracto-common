import React, {Component} from 'react';
import styled from "styled-components";
import PropTypes from "prop-types";

import LinearProgress from '@mui/material/LinearProgress';
import {Buffer} from 'buffer';

import network from "common/config/network.json";
import CoolStyles from "common/ui/CoolStyles";
import FractoIndexedTiles from "./FractoIndexedTiles";
import axios from "axios";

const FRACTO_PROD = network["fracto-prod"];
const TIMEOUT_MS = 100

const ProgressWrapper = styled(CoolStyles.Block)`
    ${CoolStyles.align_center}
    width: 20rem;
    margin: 0.5rem auto;
`
const AXIOS_CONFIG = {
   responseType: 'blob',
   headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Access-Control-*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
   },
   mode: 'no-cors',
   crossdomain: true,
}

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
      this.get_manifest()
   }

   get_manifest = async () => {
      const {set_name} = this.props
      const url = `${FRACTO_PROD}/manifest/tiles/${set_name}/packet_manifest.json`
      try {
         const response = await axios.get(url, AXIOS_CONFIG);
         const blob = new Blob([response.data], {type: 'application/gzip'});
         const arrayBuffer = await blob.arrayBuffer();
         const buffer = Buffer.from(arrayBuffer);
         const ascii = Buffer.from(buffer, 'ascii');
         const manifest = JSON.parse(ascii.toString());
         this.setState({
            packet_files: manifest.packet_files,
            tile_count: manifest.tile_count
         })
         setTimeout(() => {
            this.load_packet(0)
         }, TIMEOUT_MS)
      } catch (e) {
         console.log('error in get_manifest()', e);
      }
   }

   load_packet = async (packet_index) => {
      const {packet_files} = this.state
      const {set_name, on_complete} = this.props

      if (packet_index >= packet_files.length) {
         const complete_message = `${set_name} tile index loaded`
         console.log(complete_message)
         on_complete(complete_message)
         return;
      }
      this.setState({packet_index: packet_index})
      const url = `${FRACTO_PROD}/manifest/tiles/${set_name}/${packet_files[packet_index]}`
      try {
         const response = await axios.get(url, AXIOS_CONFIG);
         const blob = new Blob([response.data], {type: 'application/gzip'});
         const arrayBuffer = await blob.arrayBuffer();
         const buffer = Buffer.from(arrayBuffer);
         const ascii = Buffer.from(buffer, 'ascii');
         const packet_data = JSON.parse(ascii.toString());
         const level = packet_data.level
         this.setState({loading_level: level})
         FractoIndexedTiles.integrate_tile_packet(set_name, packet_data)
         setTimeout(() => {
            this.load_packet(packet_index + 1)
         }, TIMEOUT_MS)
      } catch (e) {
         console.log('error in get_manifest()', e);
      }
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
