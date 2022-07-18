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
`;
