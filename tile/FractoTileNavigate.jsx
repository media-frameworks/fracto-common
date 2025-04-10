import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles, CoolButton} from 'common/ui/CoolImports';
import LinearProgress from "@mui/material/LinearProgress";

const NAV_BUTTON_STYLE = {
   fontFamily: "monospace",
   fontSize: "0.85rem",
   fontWeight: "bold",
   padding: "0.25rem 0.5rem",
   margin: "0 0.05rem"
}

const NavigateWrapper = styled(CoolStyles.Block)`
    ${CoolStyles.align_center}
    margin: 0;
`;
const ProgressWrapper = styled(CoolStyles.InlineBlock)`
    ${CoolStyles.align_center}
    margin: 0.5rem auto;
    width: 30rem;
`;

const StatusText = styled(CoolStyles.InlineBlock)`
    ${CoolStyles.align_center}
    ${CoolStyles.align_middle}
    ${CoolStyles.italic}
    ${CoolStyles.bold}
    background-color: #f8f8f8;
    margin: 0 0.5rem;
    font-size: 1.125rem;
    color: #888888;
    line-height: 1.5rem;
`;

export class FractoTileNavigate extends Component {

   static propTypes = {
      level_tiles: PropTypes.array.isRequired,
      tile_index: PropTypes.number.isRequired,
      automate: PropTypes.bool.isRequired,
      on_index_change: PropTypes.func.isRequired,
      on_automate: PropTypes.func.isRequired
   }

   state = {};

   navigate_tile = (tile_index) => {
      const {on_index_change} = this.props;
      on_index_change(tile_index)
   }

   render_button = (number, label) => {
      const {level_tiles, tile_index} = this.props;
      if (Math.abs(number) > level_tiles.length) {
         return []
      }
      const result_number = tile_index + number;
      return <CoolButton
         key={`nav-button-${label}`}
         primary={result_number >= 0 && result_number < level_tiles.length}
         disabled={false}
         content={label}
         style={NAV_BUTTON_STYLE}
         on_click={r => this.navigate_tile(result_number)}
      />
   }

   render_nav_buttons = () => {
      const {level_tiles, tile_index, automate, on_automate} = this.props;
      const nav_buttons = [
         <CoolButton
            key={`nav-button-${"first"}`}
            primary={true}
            disabled={false}
            content={"first"}
            style={NAV_BUTTON_STYLE}
            on_click={r => this.navigate_tile(0)}
         />,
         this.render_button(-100000, "-100k"),
         this.render_button(-10000, "-10k"),
         this.render_button(-1000, "-1k"),
         this.render_button(-100, "-100"),
         this.render_button(-10, "-10"),
         this.render_button(-1, "-1"),
         <CoolButton
            key={`nav-button-${"go"}`}
            primary={true}
            content={automate ? "pause" : "go"}
            style={{margin: "0 0.25rem"}}
            on_click={r => on_automate(!automate)}
         />,
         this.render_button(1, "+1"),
         this.render_button(10, "+10"),
         this.render_button(100, "+100"),
         this.render_button(1000, "+1k"),
         this.render_button(10000, "+10k"),
         this.render_button(100000, "+100k"),
         <CoolButton
            key={`nav-button-${"final"}`}
            primary={true}
            disabled={false}
            content={"final"}
            style={NAV_BUTTON_STYLE}
            on_click={r => this.navigate_tile(level_tiles.length - 1)}
         />,
      ]
      const offset = tile_index === level_tiles.length - 1 ? 1 : 0
      const percent_complete = Math.round(10000 * (tile_index + offset) / level_tiles.length) / 100
      const top_row_buttons = <StatusText key={'just-status'}>
         {`${tile_index + offset} of ${level_tiles.length} (${percent_complete}%),  ${level_tiles.length - tile_index - offset} remain`}
      </StatusText>
      const progress_style = {width: '40rem', textAlign: 'center'};
      return [
         <NavigateWrapper key={'top-row-buttons'}>{top_row_buttons}</NavigateWrapper>,
         <NavigateWrapper key={'nav-buttons'}>{nav_buttons}</NavigateWrapper>,
         <ProgressWrapper>
            <LinearProgress variant="determinate" value={percent_complete}/>
         </ProgressWrapper>,
      ]
   }

   render() {
      const button_bar = this.render_nav_buttons()
      return <NavigateWrapper>
         {button_bar}
      </NavigateWrapper>
   }
}

export default FractoTileNavigate;
