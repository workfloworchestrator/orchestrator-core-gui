import { css } from "@emotion/core";

import {
    DARK_GREY_COLOR,
    LIGHTER_GREY_COLOR,
    LIGHT_GOLD_COLOR,
    LIGHT_PRIMARY_COLOR,
    LIGHT_SUCCESS_COLOR,
} from "../../../stylesheets/emotion/colors";
import { shadeColor } from "../../../stylesheets/emotion/utils";

export const ipPrefixTableStyling = css`
    table.ip-blocks {
        word-break: break-all;
        margin-bottom: 20px;

        td,
        th {
            text-align: left;
        }
        tr {
            border-bottom: 1px solid ${LIGHTER_GREY_COLOR};
        }
        tr.Allocated {
            cursor: pointer;
            background-color: ${LIGHT_PRIMARY_COLOR};
            &:hover {
                background-color: ${shadeColor(LIGHT_PRIMARY_COLOR, -10)};
            }
        }
        tr.Planned {
            cursor: default;
            background-color: ${LIGHT_GOLD_COLOR};
        }
        tr.Free {
            cursor: pointer;
            background-color: ${LIGHT_SUCCESS_COLOR};
            &:hover {
                background-color: ${shadeColor(LIGHT_SUCCESS_COLOR, -10)};
            }
        }
        tr.Subnet {
            background-color: ${shadeColor(LIGHT_PRIMARY_COLOR, -30)};
            cursor: default;
        }
        tr.selected {
            background-color: ${DARK_GREY_COLOR};
            color: white;
            &:hover {
                background-color: black;
            }
        }
        thead {
            display: block;
            th {
                cursor: pointer;
                padding: 5px 5px 10px 5px;
            }
            th.id {
                min-width: 8em;
            }
            th.prefix {
                min-width: 15em;
            }
            th.description {
                width: 30em;
            }
            th.state {
                min-width: 25em;
            }
        }

        tbody {
            min-width: 1000px;
            height: 240px;
            display: block;
            overflow: auto;
            td {
                word-break: break-word;
                word-wrap: break-word;
                padding: 15px 5px;
            }
            td.id {
                min-width: 8em;
            }
            td.prefix {
                min-width: 15em;
            }
            td.description {
                width: 30em;
            }
            td.state {
                min-width: 25em;
            }
        }
    }
`;
