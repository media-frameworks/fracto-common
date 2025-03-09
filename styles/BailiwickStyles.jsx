import styled from "styled-components";
import {CoolColors, CoolStyles} from 'common/ui/CoolImports'

export class BailiwickStyles {
   static ContentWrapper = styled(CoolStyles.Block)`
       overflow-y: scroll;
   `
   static BailiwickNameBlock = styled(CoolStyles.InlineBlock)`
       margin-bottom: 0.25rem;
   `;

   static BailiwickNameSpan = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.bold}
       ${CoolStyles.monospace}
       ${CoolStyles.narrow_text_shadow}
       font-size: 1.5rem;
   `;

   static BigColorBox = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.narrow_border_radius}
       ${CoolStyles.narrow_text_shadow}
       ${CoolStyles.monospace}
       ${CoolStyles.bold}
       padding: 0 0.125rem;
       border: 0.1rem solid #555555;
       color: white;
       margin-right: 0.5rem;
       font-size: 1.5rem;
   `;

   static StatsWrapper = styled(CoolStyles.Block)`
       ${CoolStyles.bold}
       ${CoolStyles.italic}
       font-size: 0.85rem;
       color: #444444;
   `;

   static StatLabel = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.bold}
       vertical-align: text-bottom;
       font-size: 0.95rem;
       color: #444444;
       margin-right: 0.25rem;
       line-height: 1.125rem;
   `;

   static StatValue = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.monospace}
       ${CoolStyles.bold}
       font-size: 0.95rem;
       color: black;
       vertical-align: text-bottom;
       line-height: 1.125rem;
   `;

   static BigStatValue = styled(BailiwickStyles.StatValue)`
       font-size: 1.25rem;
   `

   static InlineWrapper = styled(CoolStyles.InlineBlock)`
       margin-left: 0.25rem;
   `;

   static LowerWrapper = styled(CoolStyles.Block)`
       margin: 0 1rem 0.125rem 1rem;
       overflow: hidden;
   `;

   static CheckboxWrapper = styled(CoolStyles.InlineBlock)`
       margin-top: 0.25rem;
       overflow: hidden;
   `;
   static CheckboxLabel = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.bold}
       ${CoolStyles.italic}
       margin-top: 0.25rem;
       margin-right: 1rem;
       color: #444444;
   `;

   static PublishButton = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.uppercase}
       ${CoolStyles.pointer}
       color: white;
       background-color: ${CoolColors.cool_blue};
       padding: 0.125rem 0.5rem;
       border: 0.1rem solid ${CoolColors.deep_blue};
       border-radius: 0.25rem;
       font-size: 0.75rem;
       opacity: 0.65;
       margin-left: 1rem;
       margin-top: 0.5rem;
       &:hover {
           opacity: 1.0;
       }
   `;
   static ExportButton = styled(BailiwickStyles.PublishButton)`
       float: right;
   `

   static ThumbnailWrapper = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.pointer}
       float: right;
       vertical-align: top;
       margin: 0.25rem;
   `;
   static ThumbnailName = styled(CoolStyles.InlineBlock)`
       ${CoolStyles.pointer}
       ${CoolStyles.monospace}
       color: ${CoolColors.deep_blue};
       font-size: 0.85rem;
       margin-right: 0.5rem;
   `;
}

export default BailiwickStyles
