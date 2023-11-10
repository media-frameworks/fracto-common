import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolSlider, CoolStyles} from 'common/ui/CoolImports';

const MIN_SCOPE = 2
const MAX_SCOPE = 32

const ScopeButton = styled(CoolStyles.Block)`
   ${CoolStyles.monospace}
   ${CoolStyles.bold}
   ${CoolStyles.align_center}
   ${CoolStyles.pointer}
   ${CoolStyles.noselect}
   width: 17px;
   height: 17px;
   margin-right: 0.1rem;
   background-color: #888888;
   color: white;
   border-radius: 2px;
   font-size: 0.85rem:
`;

const LevelsWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem 0;
`;

export class FractoLevelSlider extends Component {

   static propTypes = {
      selected_level: PropTypes.number.isRequired,
      on_change: PropTypes.func.isRequired,
      width_px: PropTypes.number,
      height_px: PropTypes.number.isRequired,
      in_wait: PropTypes.bool.isRequired,
   }

   alter_scope = (e, amount) => {
      const {selected_level, in_wait, on_change} = this.props
      if (in_wait) {
         return;
      }
      let new_level = selected_level + 10 * amount
      if (e.shiftKey) {
         new_level = selected_level + amount
      }
      on_change(new_level)
   }

   on_change = (e) => {
      const {on_change, in_wait} = this.props
      if (in_wait) {
         return;
      }
      on_change(e.target.value)
   }

   render() {
      const {selected_level, in_wait, height_px} = this.props
      const cursor_style = {cursor: in_wait ? "wait" : "pointer"}
      let slider_style = Object.assign({}, cursor_style)
      slider_style.height = `${height_px - 40}px`
      const plus_button = <ScopeButton
         title={in_wait ? "zoom disabled while update in progress" : "press shift for small changes"}
         style={cursor_style}
         onClick={e => this.alter_scope(e, 0.1)}>
         {"+"}
      </ScopeButton>
      const minus_button = <ScopeButton
         title={in_wait ? "zoom disabled while update in progress" : "press shift for small changes"}
         style={cursor_style}
         onClick={e => this.alter_scope(e, -0.1)}>
         {"-"}
      </ScopeButton>
      return [
         plus_button,
         <LevelsWrapper
            style={slider_style}
            key={'level-buttons'}>
            <CoolSlider
               min={MIN_SCOPE}
               max={MAX_SCOPE}
               step_count={(MAX_SCOPE - MIN_SCOPE) * 10}
               value={selected_level}
               on_change={value => this.on_change(value)}
               is_vertical={true}
            />
         </LevelsWrapper>,
         minus_button
      ]
   }
}

export default FractoLevelSlider
