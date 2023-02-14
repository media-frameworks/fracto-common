import styled from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";
import FractoLocate from "./FractoLocate";
import FractoUtil from "./FractoUtil";
import FractoRender from "./FractoRender";
import {get_ideal_level} from "./FractoData";

const TitleBar = styled(AppStyles.Block)`
   background: linear-gradient(120deg, #999999, #eeeeee);
   height: 1.125rem;
   width: 100%;
   border-bottom: 0.15rem solid #666666;
`;

const TitleSpan = styled.span`
   ${AppStyles.uppercase}
   ${AppStyles.noselect}
   ${AppStyles.bold}
   font-size: 1.125rem;
   letter-spacing: 0.5rem;
   margin-left: 1rem;
   color: white;
   text-shadow: 0.01rem 0.01rem 0.2rem black;
`;

export const render_title_bar = (title) => <TitleBar><TitleSpan>{title}</TitleSpan></TitleBar>;

const MainLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.link}
   ${AppStyles.italic}
   ${AppStyles.underline}
   ${AppColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin: 0 1rem;
`;

export const render_main_link = (text, cb) => <MainLink onClick={e => cb(e)}>{text}</MainLink>

const ModalTitleBar = styled(AppStyles.Block)`
   ${AppStyles.centered};
   ${AppStyles.uppercase};
   letter-spacing: 0.75rem;
   color: #888888;
   font-size: 0.85rem;
   border-bottom: 0.125rem solid ${AppColors.HSL_COOL_BLUE};
   margin: 0.5rem 1rem;
`;

export const render_modal_title = (title) => <ModalTitleBar>{title}</ModalTitleBar>

const LocateWrapper = styled(AppStyles.InlineBlock)`   
   ${AppStyles.noselect}
   border: 0.125rem solid #aaaaaa;
   width: 32rem;
   height: 6.25rem;
   border-radius: 0.25rem;
`;

export const render_fracto_locate_cb = (fracto_values, width_px, cb) => {
   const best_level = get_ideal_level(width_px, fracto_values.scope)
   return <LocateWrapper>
      <FractoLocate level={best_level} fracto_values={fracto_values} cb={values => cb(values)}/>
   </LocateWrapper>
}

const PatternBlock = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   font-size: 1.25rem;
   border: 0.1rem solid #666666;
   border-radius: 0.25rem;
   color: white;
   padding: 0.125rem 0.125rem 0;
   line-height: 1rem;
`;

const FRACTO_COLOR_ITERATIONS = 200;

export const render_pattern_block = (pattern) => {
   const pattern_color = FractoUtil.fracto_pattern_color(pattern, FRACTO_COLOR_ITERATIONS);
   return <PatternBlock
      style={{backgroundColor: pattern_color}}>
      {pattern}
   </PatternBlock>
}

const ShortCodeSpan = styled.span`
   ${AppStyles.monospace}
   font-size: 1.125rem;
   color: white;
   border-radius: 0.25rem;
   padding: 0.125rem 0.25rem 0;
   margin-right: 0.5rem;
   background-color: ${AppColors.HSL_DEEP_BLUE};
`;

export const render_short_code = (short_code) => {
   return <ShortCodeSpan>{short_code}</ShortCodeSpan>
}

const RenderWrapper = styled(AppStyles.InlineBlock)`
   margin: 0 1rem 1rem 0;
   border: 0.125rem solid #aaaaaa;
   border-radius: 0.25rem;
`;

export const render_fracto_navigation = (fracto_values, width_px, point_highlights, inner_content, values_cb) => {
   const aspect_ratio = fracto_values.aspect_ratio ? fracto_values.aspect_ratio : 1.0;
   const fracto_render = <RenderWrapper>
      <FractoRender
         width_px={width_px}
         aspect_ratio={aspect_ratio}
         initial_params={fracto_values}
         on_param_change={values => values_cb(values)}
         point_highlights={point_highlights}/>
   </RenderWrapper>
   const fracto_locate = render_fracto_locate_cb(fracto_values, width_px, values => {
      console.log("render_fracto_locate_cb(fracto_values", width_px, values)
      values_cb(values)
   });
   return [
      fracto_render,
      <AppStyles.InlineBlock>
         <AppStyles.Block>
            {fracto_locate}
         </AppStyles.Block>
         <AppStyles.Block>
            {inner_content}
         </AppStyles.Block>
      </AppStyles.InlineBlock>
   ]
}
