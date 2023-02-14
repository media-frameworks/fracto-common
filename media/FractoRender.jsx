import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import FractoActiveImage from "./FractoActiveImage";
import {get_ideal_level} from "./FractoData";

const RE_SCOPE_FACTOR = 1.25;
const DEFAULT_SCOPE = 4;
const DEFAULT_FOCAL_POINT = {x: -0.75, y: 0.0};

const TileBox = styled.div`
   position: fixed;
   border: 0.125rem solid red;
   pointer-events: none;
`;

const HighlightBox = styled.div`
   position: fixed;
   border: 1px solid white;
   pointer-events: none;
`;

export class FractoRender extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      on_param_change: PropTypes.func.isRequired,
      aspect_ratio: PropTypes.number,
      initial_params: PropTypes.object,
      tile_outline: PropTypes.object,
      point_highlights: PropTypes.array,
      render_level: PropTypes.number,
   }

   static defaultProps = {
      aspect_ratio: 1,
      initial_params: {
         scope: DEFAULT_SCOPE,
         focal_point: DEFAULT_FOCAL_POINT
      },
      tile_outline: null,
      point_highlights: [],
      render_level: 0
   };

   componentDidMount() {
      const {initial_params} = this.props;
      this.setState({
         scope: initial_params.scope,
         focal_point: {
            x: initial_params.focal_point.x,
            y: initial_params.focal_point.y
         }
      })
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {initial_params} = this.props;
      const focal_x_changed_state = initial_params.focal_point.x !== this.state.focal_point.x;
      const focal_y_changed_state = initial_params.focal_point.y !== this.state.focal_point.y;
      if (focal_x_changed_state || focal_y_changed_state) {
         const new_focal_point = {
            x: initial_params.focal_point.x,
            y: initial_params.focal_point.y
         };
         this.setState({focal_point: new_focal_point});
      }
      if (initial_params.scope !== prevProps.initial_params.scope
         && this.state.scope !== initial_params.scope
         && initial_params.scope > 0) {
         this.setState({scope: initial_params.scope});
         console.log("componentDidUpdate initial_params", initial_params)
      }
   }

   state = {
      focal_point: {x: 0, y: 0},
      scope: 0,
      fracto_ref: React.createRef(),
      in_update: true
   };

   static get_offset = (el) => {
      var _x = 0;
      var _y = 0;
      while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
         _x += el.offsetLeft - el.scrollLeft;
         _y += el.offsetTop - el.scrollTop;
         el = el.offsetParent;
      }
      return {top: _y, left: _x};
   }

   focal_point_from_pos = (img_x, img_y) => {
      const {width_px, aspect_ratio} = this.props;
      const {focal_point, scope} = this.state;

      const x_portion = img_x / width_px;
      const y_portion = img_y / (width_px * aspect_ratio);

      const half_scope = scope / 2;
      const focal_x = (focal_point.x - half_scope) + x_portion * scope;
      const focal_y = (focal_point.y + half_scope * aspect_ratio) - y_portion * scope * aspect_ratio;

      return {x: focal_x, y: focal_y}
   }

   re_position = (e) => {
      const {on_param_change} = this.props;
      const {scope, fracto_ref, in_update} = this.state;
      if (in_update) {
         console.log("re_position returning during update");
         return;
      }
      const image_bounds = fracto_ref.current.getBoundingClientRect();
      const image_offset = FractoRender.get_offset(e.target)
      if (e.clientX < image_offset.left) {
         return;
      }
      if (e.clientX > image_offset.left + image_bounds.width) {
         return;
      }
      if (e.clientY < image_offset.top) {
         return;
      }
      if (e.clientY > image_offset.top + image_bounds.height) {
         return;
      }
      const new_focal_point = this.focal_point_from_pos(e.clientX - image_offset.left, e.clientY - image_offset.top)
      this.setState({
         focal_point: new_focal_point,
         in_update: true
      });
      on_param_change({
         scope: scope,
         focal_point: new_focal_point
      });
   }

   re_scope = (e) => {
      const {scope, focal_point, in_update} = this.state;
      const {on_param_change} = this.props;
      if (in_update) {
         console.log("re_scope returning during update");
         return;
      }
      let new_scope = scope;
      if (e.deltaY > 0) {
         new_scope *= RE_SCOPE_FACTOR;
      } else if (e.deltaY < 0) {
         new_scope /= RE_SCOPE_FACTOR;
      }
      this.setState({
         scope: new_scope,
         in_update: true
      });
      on_param_change({
         scope: new_scope,
         focal_point: focal_point
      });
   }

   re_locate = (e) => {
      const {scope, focal_point} = this.state;
      const {on_param_change} = this.props;
      if (!e) { // mouse out of element
         on_param_change({
            scope: scope,
            focal_point: focal_point,
            location: null
         });
      } else {
         const image_offset = FractoRender.get_offset(e.target)
         const new_location = this.focal_point_from_pos(e.clientX - image_offset.left, e.clientY - image_offset.top)
         on_param_change({
            scope: scope,
            focal_point: focal_point,
            location: new_location
         });
      }
   }

   highlight_points = () => {
      const {focal_point, scope, fracto_ref} = this.state;
      const {width_px, aspect_ratio, point_highlights} = this.props;
      if (!fracto_ref.current || !point_highlights) {
         return [];
      }

      const image_bounds = fracto_ref.current.getBoundingClientRect();
      const scope_x_by_2 = scope / 2;
      const scope_y_by_2 = aspect_ratio * scope_x_by_2;
      const leftmost = focal_point.x - scope_x_by_2;
      const topmost = focal_point.y + scope_y_by_2;

      return point_highlights.map(point_highlight => {

         if (point_highlight.x < leftmost || point_highlight.x > leftmost + scope) {
            return [];
         }
         if (point_highlight.y > topmost || point_highlight.y < topmost - scope * aspect_ratio) {
            return [];
         }
         const img_x = width_px * (point_highlight.x - leftmost) / scope - 1
         const img_y = width_px * (topmost - point_highlight.y) / (scope * aspect_ratio) - 1

         const highlight_outline_1 = {
            left: image_bounds.left + img_x - 5,
            top: image_bounds.top + img_y - 5,
            width: 10,
            height: 10,
         }
         const highlight_outline_2 = {
            left: image_bounds.left + img_x - 10,
            top: image_bounds.top + img_y - 10,
            width: 20,
            height: 20,
         }
         const highlight_outline_3 = {
            left: image_bounds.left + img_x - 15,
            top: image_bounds.top + img_y - 15,
            width: 30,
            height: 30,
         }
         return [
            <HighlightBox style={highlight_outline_1}/>,
            <HighlightBox style={highlight_outline_2}/>,
            <HighlightBox style={highlight_outline_3}/>,
         ]
      })
   }

   render() {
      const {focal_point, scope, fracto_ref, in_update} = this.state;
      const {width_px, aspect_ratio, tile_outline, point_highlights, render_level} = this.props;
      const highlights = in_update || !point_highlights.length ? [] : this.highlight_points()

      const fracto_image = !scope ? '' : <FractoActiveImage
         on_click={e => this.re_position(e)}
         on_zoom={e => this.re_scope(e)}
         on_ready={e => {
            if (in_update) {
               this.setState({in_update: false})
            }
         }}
         on_move={e => this.re_locate(e)}
         width_px={width_px}
         aspect_ratio={aspect_ratio}
         focal_point={focal_point}
         scope={scope}
         level={render_level ? render_level : get_ideal_level(width_px, scope)}
      />
      return <AppStyles.Block
         ref={fracto_ref}>
         {fracto_image}
         {tile_outline && <TileBox style={tile_outline}/>}
         {highlights}
      </AppStyles.Block>
   }

}

export default FractoRender;
