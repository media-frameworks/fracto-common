import React from 'react';
import styled from "styled-components";

import Magnifier from "react-magnifier";

import {CoolStyles, CoolColors, CoolInputText, CoolModal, CoolButton} from "common/ui/CoolImports";

import FractoUtil from "./FractoUtil";
import {render_modal_title} from "./FractoStyles";

import Logo from "common/app/logo.jpg"

const MAGNIFIER_WIDTH_PX = 220;
const MAX_IMAGE_SIZE_PX = 650;

const NamePrompt = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.bold}
   color: #666666;
   font-size: 1rem;
   margin: 1rem 0 0 2rem;
   width: 7.5rem;
   text-align: right;
`;

const NameInputWrapper = styled(CoolStyles.InlineBlock)`
   font-size: 1rem;
   margin: 0.5rem 0 0 0.5rem;
`;

const DirPrompt = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.italic}
   ${CoolStyles.bold}
   font-size: 0.85rem;
   margin-left: 10.5rem;
   color: #999999;
`;

const DirName = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.monospace}
   font-size: 0.85rem;
   margin-left: 0.25rem;
`;

const PromptWrapper = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   margin: 1rem 0;
   color: #333333;
   font-size: 1.25rem;
`;

const PromptSpan = styled.span`
   ${CoolStyles.bold}
`;

const ButtonsRow = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   margin-bottom: 1rem;
`;

const ButtonWrapper = styled(CoolStyles.InlineBlock)`
   margin: 0 0.5rem;
`;

const ImageWrapper = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.align_center}
   margin: 1rem;
`;

const LoadingWaitWrapper = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   border: 0.5rem double ${CoolColors.cool_blue};
   margin: 0;
`;

const CenteredBlock = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
`;

const MessageText = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   ${CoolStyles.italic}
   padding-top: 0.5rem;
   font-size: 1.125rem;
`;

const ExtraText = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}
   ${CoolStyles.italic}
   padding-bottom: 0.5rem;
   font-size: 1.125rem;
`;

const LogoImage = styled.img`
    width: 120px;
    padding-top: 0.5rem;
`;

const LevelBlockWrapper = styled(CoolStyles.Block)`
   ${CoolStyles.align_center}   
   ${CoolStyles.pointer}   
   background-color: #cccccc;
   width: 3rem;
`;

const ColorBox = styled(CoolStyles.InlineBlock)`
   ${CoolStyles.narrow_border_radius}
   ${CoolStyles.narrow_text_shadow}
   ${CoolStyles.monospace}
   ${CoolStyles.bold}
   ${CoolStyles.noselect}
   padding: 0.125rem 0.25rem 0;
   border: 0.1rem solid #555555;
   color: white;
   margin: 0.125rem 0;
   font-size: 0.85rem;
`;

export const ENTITY_STATUS_PREP = "PREP";
export const ENTITY_STATUS_DRAFT = "DRAFT";
export const ENTITY_STATUS_REVIEW = "REVIEW";
export const ENTITY_STATUS_PUBLISHED = "PUBLISHED";

export class FractoCommon {

   static render_entity_name_input = (entity_name, entity_value, cb) => {
      const name_prompt = <NamePrompt>{entity_name} name:</NamePrompt>
      const name_input = <NameInputWrapper>
         <CoolInputText
            value={entity_value}
            callback={value => cb(value)}
            style_extra={{padding: "0.25rem 0.5rem", fontSize: "1.125rem", marginBottom: 0}}
            on_change={value => cb(value)}
         />
      </NameInputWrapper>

      const dir_prompt = <DirPrompt>{"folder name will be:"}</DirPrompt>
      const dir_name = <DirName>{FractoUtil.get_dirname_slug(entity_value)}</DirName>

      return [
         <CoolStyles.Block>{[name_prompt, name_input]}</CoolStyles.Block>,
         <CoolStyles.Block>{[dir_prompt, dir_name]}</CoolStyles.Block>
      ]
   }

   static modal_confirm = (prompt, options, response) => {
      const title = render_modal_title("please confirm");
      const buttons = options.map((option, i) => {
         return <ButtonWrapper>
            <CoolButton
               primary={i}
               content={option}
               on_click={e => response(i)}/>
         </ButtonWrapper>
      })
      return <CoolModal
         contents={[
            title,
            <PromptWrapper><PromptSpan>{prompt}</PromptSpan></PromptWrapper>,
            <ButtonsRow>{buttons}</ButtonsRow>
         ]}
         width={"25rem"}
         response={r => response(r)}
      />
   }

   static view_image = (dim, png_href, cb) => {
      const title = render_modal_title(`view image: ${dim}`);
      const image_width = dim < 1024 ? dim : MAX_IMAGE_SIZE_PX;
      const image = dim < 1024 ? <img
         src={png_href}
         alt={"generated by am-chill-whale"}
         width={`${image_width}px`}
         style={{imageRendering: "pixelated"}}
      /> : <Magnifier
         src={png_href}
         alt={"generated by am-chill-whale"}
         width={`${image_width}px`}
         zoomFactor={2.0}
         style={{imageRendering: "pixelated"}}
         mgWidth={MAGNIFIER_WIDTH_PX}
         mgHeight={MAGNIFIER_WIDTH_PX}
      />
      const wrapper_width = `${image_width + 60}px`;
      return <CoolModal
         contents={[
            title,
            <ImageWrapper>{image}</ImageWrapper>,
            <ButtonsRow>
               <CoolButton
                  primary={true}
                  content={"Done"}
                  on_click={() => cb()}/>
            </ButtonsRow>
         ]}
         width={wrapper_width}
         response={r => cb()}
      />
   }

   static loading_wait_notice = (extra = null) => {
      const extra_block = !extra ? '' : <CenteredBlock>
         <ExtraText>{extra}</ExtraText>
      </CenteredBlock>
      const modal_contents = <LoadingWaitWrapper>
         <CenteredBlock><MessageText>{"Loading tile data, please look busy..."}</MessageText></CenteredBlock>
         <CenteredBlock><LogoImage
            width={100}
            src={Logo}
            alt={"am-chill-whale"}
         />
         </CenteredBlock>
         {extra_block}
      </LoadingWaitWrapper>
      return <CoolModal
         width={"24rem"}
         settings={{no_escape: true}}
         contents={modal_contents}
      />
   }

   static level_button_stack = (selected_level, max_level, on_selected) => {
      const button_style = {
         backgroundColor: FractoUtil.fracto_pattern_color(0, 25)
      }
      const selected_style = {
         backgroundColor: "white",
         color: 'black',
         fontWeight: "bold",
         fontSize: "1.75rem"
      }
      const selected_block_style = {
         backgroundColor: "white"
      }
      const all_levels = []
      for (let i = 2; i < max_level; i++) {
         all_levels.push(i)
      }
      return all_levels.map(level => {
         return <LevelBlockWrapper
            style={level === selected_level ? selected_block_style : {}}
            onClick={e => on_selected(level)}>
            <ColorBox
               style={level === selected_level ? selected_style : button_style}>
               {level}
            </ColorBox>
         </LevelBlockWrapper>
      })
   }
}

export default FractoCommon
