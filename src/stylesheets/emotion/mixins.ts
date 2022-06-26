import { css } from "@emotion/core";
import { DARKER_PRIMARY, DARK_GREY_COLOR, LIGHTER_GREY_COLOR, PRIMARY_COLOR } from "stylesheets/emotion/colors";
import { SIZE_BR } from "stylesheets/emotion/vars";

import { phoneMediaQuery } from "./mediaQueries";

export const infoIconMixin = css`
    color: ${PRIMARY_COLOR};
    margin-left: 5px;
    font-size: 16px;
    font-weight: bold;
`;

export const cardMixin = css`
    border-bottom-left-radius: ${SIZE_BR};
    border-bottom-right-radius: ${SIZE_BR};
    padding: 0 15px;
    padding-bottom: 15px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
    h1 {
        font-size: 22px;
        color: ${DARKER_PRIMARY};
        padding-top: 15px;
        padding-bottom: 15px;
    }
`;

export const toolTipMixin = css`
    box-shadow: 1px 2px 6px 1px ${LIGHTER_GREY_COLOR};
    padding: 10px !important;
    font-size: 14px !important;
    pointer-events: auto !important;
    color: ${DARK_GREY_COLOR} !important;
    &.show {
        opacity: 1 !important;
    }
    max-width: 390px;
    ${phoneMediaQuery(
        css`
            max-width: 200px;
        `
    )}
`;

export const copyIconPulseMixin = css`
    i.copied {
        animation: pulse 1s;
        animation-iteration-count: 1;
        border-radius: 50%;
        position: relative;
    }

    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 white;
        }
        70% {
            box-shadow: 0 0 10px 8px color.adjust(vars.$primary, $lightness: 15%);
        }
        100% {
            box-shadow: 0 0 0 0 white;
        }
    }
`;
