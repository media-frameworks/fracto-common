import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {BailiwickStyles as styles} from '../styles/BailiwickStyles'
import {CoolStyles} from 'common/ui/CoolImports';
import FractoUtil from "fracto/common/FractoUtil";
import {render_coordinates, render_pattern_block} from "fracto/common/FractoStyles";
import BailiwickData from "../feature/BailiwickData";
import FractoRasterImage from "../render/FractoRasterImage";

export class BailiwickDetails extends Component {

   static propTypes = {
      selected_bailiwick: PropTypes.object.isRequired,
      highest_level: PropTypes.number.isRequired,
      freeform_index: PropTypes.number.isRequired
   }

   state = {
      thumbnail_canvas: null
   }

   componentDidMount() {
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {selected_bailiwick} = this.props
      if (!prevProps.selected_bailiwick) {
         return
      }
      if (prevProps.selected_bailiwick.id !== selected_bailiwick.id) {
         this.setState({node_index: 0})
      }
   }

   render_magnitude = () => {
      const {selected_bailiwick} = this.props;
      const rounded = Math.round(selected_bailiwick.magnitude * 100000000) / 100
      const mu = <i>{'\u03BC'}</i>
      return <CoolStyles.Block>
         <styles.StatLabel>magnitude:</styles.StatLabel>
         <styles.BigStatValue>{rounded}{mu}</styles.BigStatValue>
         <styles.InlineWrapper>
            <styles.StatValue>{`(${selected_bailiwick.magnitude})`}</styles.StatValue>
         </styles.InlineWrapper>
      </CoolStyles.Block>
   }

   render_core_point = () => {
      const {selected_bailiwick} = this.props;
      const core_point_data = typeof selected_bailiwick.core_point === 'string'
         ? JSON.parse(selected_bailiwick.core_point)
         : selected_bailiwick.core_point
      const core_point = render_coordinates(core_point_data.x, core_point_data.y);
      return <CoolStyles.Block>
         <styles.StatLabel>core point:</styles.StatLabel>
         <styles.StatValue>{core_point}</styles.StatValue>
      </CoolStyles.Block>
   }

   set_inline = (e) => {
      const {selected_bailiwick, freeform_index} = this.props
      selected_bailiwick.is_inline = selected_bailiwick.is_inline ? 0 : 1
      console.log('selected_bailiwick', selected_bailiwick)
      if (typeof selected_bailiwick.core_point === 'string') {
         selected_bailiwick.core_point = JSON.parse(selected_bailiwick.core_point)
      }
      if (typeof selected_bailiwick.octave_point === 'string') {
         selected_bailiwick.octave_point = JSON.parse(selected_bailiwick.octave_point)
      }
      if (typeof selected_bailiwick.display_settings === 'string') {
         selected_bailiwick.display_settings = JSON.parse(selected_bailiwick.display_settings)
      }
      BailiwickData.save_bailiwick(selected_bailiwick, freeform_index)
   }

   set_nodal = (e) => {
      const {selected_bailiwick, freeform_index} = this.props
      selected_bailiwick.is_node = selected_bailiwick.is_node ? 0 : 1
      console.log('selected_bailiwick', selected_bailiwick)
      if (typeof selected_bailiwick.core_point === 'string') {
         selected_bailiwick.core_point = JSON.parse(selected_bailiwick.core_point)
      }
      if (typeof selected_bailiwick.octave_point === 'string') {
         selected_bailiwick.octave_point = JSON.parse(selected_bailiwick.octave_point)
      }
      if (typeof selected_bailiwick.display_settings === 'string') {
         selected_bailiwick.display_settings = JSON.parse(selected_bailiwick.display_settings)
      }
      BailiwickData.save_bailiwick(selected_bailiwick, freeform_index)
   }

   checked_input = (name, is_checked) => {
      if (is_checked) {
         return <input
            type={"checkbox"}
            name={`checkbox-inline`}
            checked
         />
      } else {
         return <input
            type={"checkbox"}
            name={`checkbox-inline`}
         />
      }
   }

   publish = () => {
      const {selected_bailiwick} = this.props;
      BailiwickData.publish_bailiwick({
         id: selected_bailiwick.id,
         published_at: 'CURRENT_TIMESTAMP'
      })
   }

   unpublish = () => {
      const {selected_bailiwick} = this.props;
      BailiwickData.publish_bailiwick({
         id: selected_bailiwick.id,
         published_at: null
      })
   }

   render_specs = () => {
      const {selected_bailiwick} = this.props;
      // console.log('render_specs', selected_bailiwick)
      return [
         <styles.CheckboxWrapper
            onClick={this.set_inline}
            key={`checkbox-inline`}>
            {this.checked_input('checkbox-inline', selected_bailiwick.is_inline)}
         </styles.CheckboxWrapper>,
         <styles.CheckboxLabel
            onClick={this.set_inline}
            key={`label-inline`}>
            {`inline`}
         </styles.CheckboxLabel>,
         <styles.CheckboxWrapper
            onClick={this.set_nodal}
            key={`checkbox-nodal`}>
            {this.checked_input('checkbox-nodal', selected_bailiwick.is_node)}
         </styles.CheckboxWrapper>,
         <styles.CheckboxLabel
            onClick={this.set_nodal}
            key={`label-nodal`}>
            {`nodal`}
         </styles.CheckboxLabel>,
      ]
   }

   download_thumbnail = () => {
      const {thumbnail_canvas} = this.state
      const {selected_bailiwick} = this.props;
      if (!thumbnail_canvas) {
         return
      }
      const link = document.createElement('a');
      link.href = thumbnail_canvas.toDataURL();
      const filename = `${selected_bailiwick.name}.png`
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      BailiwickData.save_thumbnail(selected_bailiwick.id, filename)
      document.body.removeChild(link);
   };

   on_plan_complete = (canvas_buffer, ctx, canvas) => {
      this.setState({thumbnail_canvas: canvas})
   }

   render_thumbnail = () => {
      const {selected_bailiwick} = this.props;
      const display_settings = typeof selected_bailiwick.display_settings === 'string'
         ? JSON.parse(selected_bailiwick.display_settings)
         : selected_bailiwick.display_settings
      return <styles.ThumbnailWrapper onClick={this.download_thumbnail}>
         <CoolStyles.Block>
            <styles.ThumbnailName>
               {selected_bailiwick.thumbnail_name}
            </styles.ThumbnailName>
            <FractoRasterImage
               width_px={100}
               focal_point={display_settings.focal_point}
               scope={display_settings.scope}
               on_plan_complete={this.on_plan_complete}
            />
         </CoolStyles.Block>
      </styles.ThumbnailWrapper>
   }

   render() {
      const {selected_bailiwick, highest_level, freeform_index} = this.props;
      const bailiwick_name = selected_bailiwick.name
      const block_color = FractoUtil.fracto_pattern_color(selected_bailiwick.pattern, 1000)
      const stats = [`best level: ${highest_level}`, `freeform index: ${freeform_index + 1}`].join(', ')
      return [
         <CoolStyles.Block>
            <styles.BigColorBox
               style={{backgroundColor: block_color}}>
               {selected_bailiwick.pattern}
            </styles.BigColorBox>
            {this.render_thumbnail()}
            <styles.BailiwickNameBlock>
               <styles.BailiwickNameSpan>{bailiwick_name}</styles.BailiwickNameSpan>
               <styles.StatsWrapper>{stats}</styles.StatsWrapper>
            </styles.BailiwickNameBlock>
            <styles.PublishButton
               onClick={selected_bailiwick.published_at ? this.unpublish : this.publish}
               key={`button-publish`}>
               {selected_bailiwick.published_at ? `unpublish now` : 'publish now'}
            </styles.PublishButton>,
         </CoolStyles.Block>,
         <styles.LowerWrapper>
            {this.render_magnitude()}
            {this.render_core_point()}
            {this.render_specs()}
         </styles.LowerWrapper>
      ]
   }
}

export default BailiwickDetails;
