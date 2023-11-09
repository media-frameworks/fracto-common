import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolSlider, CoolStyles} from 'common/ui/CoolImports';

const MIN_SCOPE = 2
const MAX_SCOPE = 32

const ScopeButton = styled(CoolStyles.InlineBlock)`
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

const ScopeButtons = styled(CoolStyles.Block)`
   margin: 0;
`;

const LevelsWrapper = styled(CoolStyles.InlineBlock)`
   padding: 0.25rem;
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
      const {on_change} = this.props
      on_change(e.target.value)
   }

   render() {
      const {selected_level, in_wait, width_px, height_px} = this.props
      const cursor_style = {cursor: in_wait ? "wait" : "pointer"}
      let slider_style = Object.assign({}, cursor_style)
      slider_style.width = `${width_px}px`
      slider_style.height = `${height_px - 20}px`
      const plus_button = <ScopeButton
         style={cursor_style}
         onClick={e => this.alter_scope(e, 0.1)}>
         {"+"}
      </ScopeButton>
      const minus_button = <ScopeButton
         style={cursor_style}
         onClick={e => this.alter_scope(e, -0.1)}>
         {"-"}
      </ScopeButton>
      return [
         <ScopeButtons
            key={'scope-buttons'}>
            {minus_button}
            {plus_button}
         </ScopeButtons>,
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
         </LevelsWrapper>
      ]
   }
}

export default FractoLevelSlider
