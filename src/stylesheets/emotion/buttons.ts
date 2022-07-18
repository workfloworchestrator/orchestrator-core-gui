import { css } from "@emotion/core";
import {
    DANGER,
    LIGHTER_GREY_COLOR,
    MEDIUM_GREY_COLOR,
    PRIMARY_COLOR,
    SUCCESS,
    WARNING,
} from "stylesheets/emotion/colors";
import { SIZE_BORDER_RADIUS } from "stylesheets/emotion/vars";

export const buttonsCss = css`
    .button {
        display: inline-block;
        padding: 10px 15px;
        text-transform: uppercase;
        background-color: white;
        color: ${PRIMARY_COLOR};
        border: 1px solid ${LIGHTER_GREY_COLOR};
        border-radius: ${SIZE_BORDER_RADIUS};
        font-size: larger;
        font-weight: bold;
        text-align: center;
        cursor: pointer;

        text-decoration: none;
        &:hover,
        &:visited {
            text-decoration: none;
        }

        &:not(:last-child) {
            margin-right: 15px;
        }

        &.disabled {
            cursor: no-drop;
        }

        i {
            margin-left: 10px;
            color: ${MEDIUM_GREY_COLOR};
        }

        &.blue {
            background-color: ${PRIMARY_COLOR};
            color: white;
            border: none;
            &.error {
                background-color: ${DANGER};
            }
            i {
                color: white;
            }
        }
        &.grey {
            background-color: ${LIGHTER_GREY_COLOR};
            color: white;
            border: none;
            i {
                color: white;
            }
        }
        &.red {
            background-color: ${DANGER};
            color: white;
            border: none;
        }
        &.orange {
            background-color: ${WARNING};
            color: white;
            border: none;
            i {
                color: white;
            }
        }
        &.green {
            background-color: ${SUCCESS};
            color: white;
            border: none;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            i {
                color: white;
                margin: 0;
                font-size: larger;
            }
        }
    }
`;
