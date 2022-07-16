import { css } from "@emotion/core";
import { DANGER, SUCCESS, WARNING } from "stylesheets/emotion/colors";
import { MEDIUM_SCREEN_WITH, zIndex } from "stylesheets/emotion/vars";

import { shadeColor } from "../stylesheets/emotion/utils";

export const flashStyling = css`
    div.flash {
        color: white;

        position: fixed;
        width: 100%;
        top: 0;
        z-index: ${zIndex.flash};
        opacity: 0.9;

        transition: top 150ms ease-in-out;

        &.hide {
            transition: top 1000ms ease-in-out;
            top: -80px;
        }

        &.info {
            background-color: ${shadeColor(SUCCESS, -15)};
        }
        &.warning {
            background-color: ${WARNING};
        }
        &.error {
            background-color: ${DANGER};
        }

        .message-container {
            max-width: ${MEDIUM_SCREEN_WITH};
            margin: 0;
            position: relative;

            p {
                padding: 10px 25px 10px 15px;
                text-transform: uppercase;
                font-weight: bold;
            }
            a.close {
                text-decoration: none;
                position: absolute;
                right: 20px;
                top: -5px;
                color: white;
                font-size: larger;
                padding: 6px;
            }
        }
    }
`;
