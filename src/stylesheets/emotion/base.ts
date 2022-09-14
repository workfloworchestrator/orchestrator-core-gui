import { css } from "@emotion/core";

import { PRIMARY_COLOR } from "./colors";

export const baseCss = css`
    a {
        cursor: pointer;
        color: ${PRIMARY_COLOR};
        font-weight: bold;
    }

    *,
    *:before,
    *:after {
        box-sizing: border-box;
    }

    ::-webkit-input-placeholder,
    div.Select-placeholder {
        color: ${PRIMARY_COLOR};
    }

    ::-moz-placeholder {
        color: ${PRIMARY_COLOR};
        opacity: 1;
    }

    // Force button text color
    .euiButton--primary.euiButton--fill {
        color: #fff !important;
    }

    .euiButton--warning.euiButton--fill {
        color: #fff !important;
    }

    .euiButton--danger.euiButton--fill {
        color: #fff !important;
    }
    .euiButton--secondary.euiButton--fill {
        color: #fff !important;
    }

    .euiButton--accent.euiButton {
        background-color: #e39846 !important;
    }
    .euiButton--accent {
        &.euiButton--fill {
            color: #fff !important;
        }
    }

    .euiButton--warning.euiButton {
        background-color: #e39846 !important;
    }
    .euiButton--warning.euiButton--fill {
        color: #fff !important;
    }
`;
