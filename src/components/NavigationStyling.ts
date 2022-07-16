import { css } from "@emotion/core";
import { DARKER_PRIMARY } from "stylesheets/emotion/colors";
import { zIndex } from "stylesheets/emotion/vars";

export const navigationStyling = css`
    .sync {
        position: fixed !important;
        bottom: 8px;
        left: 8px;
        width: auto !important;
        z-index: ${zIndex.sync};
        &__label {
            font-size: 0.875em;
            margin: 0 0 0 8px !important;
            display: inline-block;
        }
        .euiToastBody {
            display: flex;
            align-items: center;
        }
        .euiToastHeader {
            display: none;
        }
    }

    .euiControlBar {
        &__controls {
            background: ${DARKER_PRIMARY};
        }
        &__text {
        }
    }

    .navigation {
        &__item {
            height: 40px;
            display: flex;
            align-items: center;
            border-bottom: 2px solid transparent;
            transition: 0.2s all ease;
            a {
                color: white;
            }
            &:hover {
                border-bottom: 2px solid white;
            }
        }
        &__active {
            border-bottom: 2px solid white;
        }
        &__cta {
            overflow: visible !important;
            button {
                font-weight: bold;
                color: white;
            }
        }
    }

    .euiControlBar__tab {
        font-family: "Roboto", sans-serif;
        font-weight: 700;
    }
`;
