import styled from "styled-components";

import {CoolStyles, CoolColors} from "common/ui/CoolImports";

import FractoUtil from "./FractoUtil";

const TitleBar = styled(CoolStyles.Block)`
   background: linear-gradient(120deg, #999999, #eeeeee);
   height: 1.125rem;
   width: 100%;
   border-bottom: 0.15rem solid #666666;
`;

const TitleSpan = styled.span`
   ${CoolStyles.uppercase}
   ${CoolStyles.noselect}
   ${CoolStyles.bold}
   font-size: 1.125rem;
   letter-spacing: 0.5rem;
   margin-left: 1rem;
   color: white;
   text-shadow: 0.01rem 0.01rem 0.2rem black;
`;

export const render_title_bar = (title) => <TitleBar><TitleSpan>{title}</TitleSpan></TitleBar>;

const MainLink = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.link}
   ${CoolStyles.italic}
   ${CoolStyles.underline}
   ${CoolColors.COLOR_COOL_BLUE};
   font-size: 1.125rem;
   margin: 0 1rem;
`;

export const render_main_link = (text, cb) => <MainLink onClick={e => cb(e)}>{text}</MainLink>

const ModalTitleBar = styled(CoolStyles.Block)`
   ${CoolStyles.centered};
   ${CoolStyles.uppercase};
   letter-spacing: 0.75rem;
   color: #888888;
   font-size: 0.85rem;
   border-bottom: 0.125rem solid ${CoolColors.HSL_COOL_BLUE};
   margin: 0.5rem 1rem;
`;

export const render_modal_title = (title) => <ModalTitleBar>{title}</ModalTitleBar>

const PatternBlock = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.monospace}
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
   ${CoolStyles.monospace}
   ${CoolStyles.narrow_border_radius}
   ${CoolStyles.narrow_box_shadow}
   font-size: 1.5rem;
   color: white;
   padding: 0.25rem 0.5rem 0.125rem;
   background-color: ${CoolColors.deep_blue};
`;

export const render_short_code = (short_code) => {
   return <ShortCodeSpan>{short_code}</ShortCodeSpan>
}

const NumberSpan = styled.span`
   ${CoolStyles.monospace}
`;

const ItalicSpan = styled.span`
   ${CoolStyles.bold}
   ${CoolStyles.italic}
   font-family: Arial;
`;

export const render_coordinates = (x, y) => {
   return [
      <NumberSpan>{`${x} + ${y}`}</NumberSpan>,
      <ItalicSpan>i</ItalicSpan>
   ]
}
