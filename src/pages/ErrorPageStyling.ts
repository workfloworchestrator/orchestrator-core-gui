import { css } from "@emotion/core";
import { MEDIUM_GREY_COLOR } from "stylesheets/emotion/colors";

import { SIZE_BORDER_RADIUS } from "../stylesheets/emotion/vars";

export const errorPageStyling = css`
    .mod-not-found,
    .mod-server-error,
    .mod-not-allowed {
        padding: 50px;
        text-align: center;
        margin: 50px 100px;
        background-color: white;
        box-shadow: 1px 4px 12px 1px ${MEDIUM_GREY_COLOR};
        border-radius: ${SIZE_BORDER_RADIUS};

        h1 {
            font-size: 200%;
            margin-bottom: 50px;
        }
    }
`;
