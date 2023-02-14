import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCaretUp, faCaretDown} from '@fortawesome/free-solid-svg-icons';

import {AppStyles, AppColors} from "app/AppImports";

const CONTROL_TYPE_UP = "control_up";
const CONTROL_TYPE_DOWN = "control_down";

const CONTROL_VALUE_SCOPE = "control_span";
// const CONTROL_VALUE_LOCATION = "control_location";

const PanelEntry = styled(AppStyles.Block)`
   margin: 0 0.5rem;
`;

const PanelLabel = styled(AppStyles.InlineBlock)`
   ${AppStyles.bold}
   text-align: right;
   width: 6rem;
   height: 1.125rem;
   font-size: 0.85rem;   
   background-color: ${AppColors.HSL_LIGHT_COOL_BLUE};
   margin-top: 0.125rem;
`;

const PanelValue = styled(AppStyles.InlineBlock)`
   text-align: left;
   padding: 0.125rem 0.25rem;
`;

const PanelControls = styled(AppStyles.InlineBlock)`
   float: left;
`;

const PanelWrapper = styled(AppStyles.Block)`
   background-color: white;
   padding: 0.5rem;
   padding-bottom: 0;
`;

const NumberSpan = styled.span`
   ${AppStyles.monospace}
   font-size: 0.85rem;
`;

const ItalicSpan = styled.span`
   ${AppStyles.bold}
   ${AppStyles.italic}
   font-family: Arial;
   font-size: 0.85rem;
`;

const IconControl = styled(AppStyles.InlineBlock)`
   text-align: left;
   font-size: 1.125rem;
   font-color: #666666;
   opacity: 0.125;
   &: hover {
      opacity: 1.0;
   }
`;

const UpDownIconControl = styled(IconControl)`
   margin: 0 0.125rem;   
`;

const TextLabel = styled(AppStyles.InlineBlock)`
   margin: 0.125rem;   
`;

export class FractoLocate extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      fracto_values: PropTypes.object.isRequired,
      cb: PropTypes.func,
   }

   state = {
      panel_ref: React.createRef(),
      bounds_left: 0
   };

   static render_coordinates = (x, y) => {
      return [
         <NumberSpan>{`${x} + ${y}`}</NumberSpan>,
         <ItalicSpan>i</ItalicSpan>
      ]
   }

   componentDidMount() {
      const {panel_ref} = this.state;
      if (panel_ref.current) {
         const bounds = panel_ref.current.getBoundingClientRect();
         this.setState({bounds_left: bounds.left + bounds.width - 100})
      }
   }

   render_controls = (control_block) => {
      const {bounds_left} = this.state;
      const {fracto_values, cb} = this.props;
      if (!cb) {
         return []
      }
      let left_px = bounds_left;
      const controls = control_block.map(block => {
         left_px -= 12;
         const icon_style = {left: `${left_px}px`}
         switch (block.type) {
            case CONTROL_TYPE_UP:
               return <UpDownIconControl
                  style={icon_style}
                  title={block.tooltip}
                  onClick={e => cb({
                     focal_point: fracto_values.focal_point,
                     scope: block.value_change === CONTROL_VALUE_SCOPE ?
                        fracto_values.scope * block.change_factor : fracto_values.scope
                  })}>
                  <FontAwesomeIcon icon={faCaretUp}/>
               </UpDownIconControl>
            case CONTROL_TYPE_DOWN:
               return <UpDownIconControl
                  style={icon_style}
                  title={block.tooltip}
                  onClick={e => cb({
                     focal_point: fracto_values.focal_point,
                     scope: block.value_change === CONTROL_VALUE_SCOPE ?
                        fracto_values.scope * block.change_factor : fracto_values.scope
                  })}>
                  <FontAwesomeIcon icon={faCaretDown}/>
               </UpDownIconControl>
            default:
               return [];
         }
      });
      return controls;
   }

   render() {
      const {panel_ref} = this.state;
      const {level, fracto_values} = this.props;
      const panel_data = [
         {
            label: "level",
            value: <NumberSpan>{level}</NumberSpan>,
            controls: [
               {
                  type: CONTROL_TYPE_UP,
                  value_change: CONTROL_VALUE_SCOPE,
                  change_factor: 1.99,
                  tooltip: "zoom out"
               },
               {
                  type: CONTROL_TYPE_DOWN,
                  value_change: CONTROL_VALUE_SCOPE,
                  change_factor: 0.51,
                  tooltip: "zoom in"
               },
            ]
         },
         {
            label: "scope",
            value: <NumberSpan>{fracto_values.scope}</NumberSpan>,
            controls: [
               {
                  type: CONTROL_TYPE_UP,
                  value_change: CONTROL_VALUE_SCOPE,
                  change_factor: 1.25,
                  tooltip: "zoom out"
               },
               {
                  type: CONTROL_TYPE_DOWN,
                  value_change: CONTROL_VALUE_SCOPE,
                  change_factor: 0.8,
                  tooltip: "zoom in"
               },
            ]
         },
         {
            label: "focal point",
            value: FractoLocate.render_coordinates(fracto_values.focal_point.x, fracto_values.focal_point.y),
         },
         {
            label: "location",
            value: !fracto_values.location ? '-' :
               FractoLocate.render_coordinates(fracto_values.location.x, fracto_values.location.y),
         }
      ];
      const panel = panel_data.map(datum => {
         let controls = '';
         if (datum.controls) {
            const rendered = this.render_controls(datum.controls);
            controls = <PanelControls>{rendered}</PanelControls>
         }
         return <PanelEntry>
            <PanelLabel>
               {controls}
               <TextLabel>{datum.label}:</TextLabel>
            </PanelLabel>
            <PanelValue>{datum.value}</PanelValue>
         </PanelEntry>
      });
      return <PanelWrapper ref={panel_ref}>{panel}</PanelWrapper>
   }

}

export default FractoLocate;