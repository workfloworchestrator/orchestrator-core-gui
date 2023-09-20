import { css } from "@emotion/core";
import {
    ACCENT,
    DANGER,
    DARK_GOLD_COLOR,
    DARK_GREY_COLOR,
    GOLD,
    LIGHTER_GREY_COLOR,
    PRIMARY_COLOR,
    WARNING,
} from "stylesheets/emotion/colors";

export const stepStyling = css`
    section.step {
        border-radius: 5%;
        color: white;
        text-align: center;
        display: flex;
        flex-direction: column;
        padding: 12px;

        &.failed {
            background-color: ${DANGER};
        }
        &.waiting {
            background-color: ${WARNING};
        }
        &.awaiting_callback {
            background-color: ${DARK_GOLD_COLOR};
        }
        &.pending {
            background-color: ${DARK_GREY_COLOR};
        }
        &.success {
            background-color: ${ACCENT};
        }
        &.skipped {
            background-color: ${LIGHTER_GREY_COLOR};
        }
        &.complete {
            background-color: ${PRIMARY_COLOR};
        }
        &.suspend {
            background-color: ${GOLD};
            color: ${DARK_GREY_COLOR};
        }
        &.abort {
            background-color: ${ACCENT};
        }
    }
`;
