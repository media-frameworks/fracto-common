import {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

// import AppStyles from "app/AppStyles";

export class FractoProfile extends Component {

   static propTypes = {
      tile_data: PropTypes.array.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {
   }

   render() {
      return "FractoProfile"
   }

}

export default FractoProfile;
