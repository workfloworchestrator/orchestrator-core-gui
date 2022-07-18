import { css } from "@emotion/core";

import { phoneMediaQuery } from "../stylesheets/emotion/mediaQueries";
import { SIZE_BORDER_RADIUS } from "../stylesheets/emotion/vars";

export const userProfileStyling = css`
    ul.user-profile {
        position: absolute;
        z-index: 2;
        padding: 10px;
        list-style: none;
        width: 500px;
        top: 50px;
        right: 20px;
        background: white;
        border-radius: ${SIZE_BORDER_RADIUS};
        overflow: scroll;
        box-shadow: 1px 1px ${SIZE_BORDER_RADIUS} rgba(black, 0.3);
        ${phoneMediaQuery(
            css`
                display: none;
            `
        )}

        li.user-attribute {
            font-style: italic;
            font-size: 13px;
            margin-bottom: 5px;
            display: block;

            span {
                &.user-key {
                    display: inline-block;
                    margin-right: 5px;
                }

                &.value {
                    font-style: normal;
                    float: right;
                }
            }
        }
    }
`;
