import {PaneFieldStyles as styles} from 'styles/PaneFieldStyles'

const CENTER_BOX_HALF_PX = 7

export const render_cross_hairs = (image_bounds, client_point, on_click) => {
   const horizontal_left_style = {
      top: `${client_point.y || -1}px`,
      left: `${image_bounds.left - 4}px`,
      width: `${client_point.x - image_bounds.left - 3}px`,
   };
   const horizontal_right_style = {
      top: `${client_point.y || -1}px`,
      left: `${client_point.x + 10}px`,
      width: `${image_bounds.right - client_point.x - 6}px`,
   };
   const vertical_top_style = {
      left: `${client_point.x || -1}px`,
      top: `${image_bounds.top - 3}px`,
      height: `${client_point.y - image_bounds.top - 4}px`,
   };
   const vertical_bottom_style = {
      left: `${client_point.x || -1}px`,
      top: `${client_point.y + 10}px`,
      height: `${image_bounds.bottom - client_point.y - 10}px`,
   };
   const box_top_style = {
      left: `${client_point.x - CENTER_BOX_HALF_PX}px`,
      width: `${2 * CENTER_BOX_HALF_PX + 2}px`,
      top: `${client_point.y - CENTER_BOX_HALF_PX - 1}px`,
   }
   const box_bottom_style = {
      left: `${client_point.x - CENTER_BOX_HALF_PX}px`,
      width: `${2 * CENTER_BOX_HALF_PX + 2}px`,
      top: `${client_point.y + CENTER_BOX_HALF_PX + 1}px`,
   }
   const box_left_style = {
      top: `${client_point.y - CENTER_BOX_HALF_PX}px`,
      left: `${client_point.x - CENTER_BOX_HALF_PX - 1}px`,
      height: `${2 * CENTER_BOX_HALF_PX + 2}px`,
   }
   const box_right_style = {
      top: `${client_point.y - CENTER_BOX_HALF_PX}px`,
      left: `${client_point.x + CENTER_BOX_HALF_PX + 1}px`,
      height: `${2 * CENTER_BOX_HALF_PX + 2}px`,
   }
   return [
      <styles.HorizontalCrossHair
         key={'horizontal-crosshair-left'}
         style={horizontal_left_style}
         onClick={on_click}
         onMouseMove={FieldUtils.on_mouse_move_not}
      />,
      <styles.HorizontalCrossHair
         key={'horizontal-crosshair-right'}
         style={horizontal_right_style}
         onClick={on_click}
         onMouseMove={FieldUtils.on_mouse_move_not}
      />,
      <styles.VerticalCrossHair
         key={'vertical-crosshair-top'}
         style={vertical_top_style}
         onClick={on_click}
         onMouseMove={FieldUtils.on_mouse_move_not}
      />,
      <styles.VerticalCrossHair
         key={'vertical-crosshair-bottom'}
         style={vertical_bottom_style}
         onClick={on_click}
         onMouseMove={FieldUtils.on_mouse_move_not}
      />,
      <styles.BoxTopBottom
         key={'center-box-top'}
         style={box_top_style}
         onClick={on_click}
         onMouseMove={FieldUtils.on_mouse_move_not}
      />,
      <styles.BoxTopBottom
         key={'center-box-bottom'}
         style={box_bottom_style}
         onClick={on_click}
         onMouseMove={FieldUtils.on_mouse_move_not}
      />,
      <styles.BoxLeftRight
         key={'center-box-left'}
         style={box_left_style}
         onClick={on_click}
         onMouseMove={FieldUtils.on_mouse_move_not}
      />,
      <styles.BoxLeftRight
         key={'center-box-right'}
         style={box_right_style}
         onClick={on_click}
         onMouseMove={FieldUtils.on_mouse_move_not}
      />,
   ]
}
   