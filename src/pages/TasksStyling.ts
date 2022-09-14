import { css } from "@emotion/core";
import { PRIMARY_COLOR } from "stylesheets/emotion/colors";

import { shadeColor } from "../stylesheets/emotion/utils";

export const tasksStyling = css`
    .actions-buttons {
        text-align: right;
        position: absolute;
        right: 16px;
        transform: translateY(10px);

        .explain {
            margin-right: 10px;
            margin-top: -2px;
            cursor: pointer;
            font-size: 22px;
            i {
                color: ${shadeColor(PRIMARY_COLOR, 5)};
                font-size: 30px;
                margin-top: 15px;
            }

            span {
                color: ${PRIMARY_COLOR};
                font-weight: bold;
            }
        }
    }
`;
