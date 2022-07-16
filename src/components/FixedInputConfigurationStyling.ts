import { css } from "@emotion/core";
import { LIGHT_GREY_COLOR, PRIMARY_COLOR } from "stylesheets/emotion/colors";
import { BORDER_LIGHT_COLOR } from "stylesheets/emotion/vars";

export const fixedInputConfigurationStyling = css`
    section.fixed-input-configuration {
        background-color: white;
        padding: 15px 0 0 0;
        margin-top: 20px;
        box-shadow: 2px 3px 3px 0 ${LIGHT_GREY_COLOR};

        h3 {
            margin-left: 10px;
            margin-bottom: 15px;
            color: ${PRIMARY_COLOR};
            font-size: 16px;
        }

        table {
            background-color: ${BORDER_LIGHT_COLOR};
            width: 100%;
            word-break: break-all;
            td,
            th {
                padding: 5px 10px;
                text-align: left;
            }
            tr {
                border-bottom: 1px solid ${LIGHT_GREY_COLOR};
            }
            th.fixed-input {
                width: 20%;
            }
            th.values {
                width: 25%;
            }
            th.description {
                width: 40%;
            }
            th.required {
                width: 15%;
            }
        }
    }
`;
