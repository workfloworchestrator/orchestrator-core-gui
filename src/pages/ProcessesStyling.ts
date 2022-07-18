import { css } from "@emotion/core";
import { PRIMARY_COLOR } from "stylesheets/emotion/colors";
import { shadeColor } from "stylesheets/emotion/utils";

export const processesStyling = css`
    div.actions {
        text-align: right;
        position: absolute;
        right: 16px;
        transform: translateY(-10px);
        .explain {
            margin-right: 10px;
            margin-top: -5px;
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
