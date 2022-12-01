import { css } from "@emotion/core";
import {
    DARKEST_PRIMARY_COLOR,
    DARK_GOLD_COlOR,
    DARK_GREY_COLOR,
    LIGHTER_GREY_COLOR,
    LIGHT_GOLD_COLOR,
    LIGHT_GREY_COLOR,
    LIGHT_PRIMARY_COLOR,
    MEDIUM_GREY_COLOR,
} from "stylesheets/emotion/colors";
import { phoneMediaQuery } from "stylesheets/emotion/mediaQueries";
import { shadeColor } from "stylesheets/emotion/utils";

const table_phone = css`
    // thead {
    //     display: none;
    // }
    // tr {
    //     margin-bottom: 10px;
    //     display: block;
    //     border-bottom: 2px solid ${LIGHTER_GREY_COLOR};
    // }
    // td {
    //     display: block;
    //     text-align: right;
    //     border-bottom: 1px dotted ${LIGHT_PRIMARY_COLOR};
    //     padding: 8px 0;
    //
    //     &:before {
    //         content: attr(data-label);
    //         float: left;
    //         text-transform: uppercase;
    //         font-weight: bold;
    //         font-size: 14px;
    //         color: ${MEDIUM_GREY_COLOR};
    //     }
    // }
`;

export const tableImpactedObjects = css`
    table.ticket-impacted-objects {
        width: 100%;
        word-break: break-all;
        margin: 10px;

        td,
        th {
            text-align: left;
            vertical-align: middle;
        }

        tr {
            cursor: pointer;

            &.light {
                border-bottom: 1px solid ${LIGHT_GREY_COLOR};
            }

            &.dark {
                border-bottom: 1px solid ${DARK_GREY_COLOR};
            }

            &:hover {
                &.light {
                    background-color: ${shadeColor(LIGHT_PRIMARY_COLOR, -10)};
                }
                &.dark {
                    background-color: ${shadeColor(DARKEST_PRIMARY_COLOR, -10)};
                }
            }
        }

        tr.override {
            /* cursor: default; */

            &.light {
                background-color: ${LIGHT_GOLD_COLOR};
            }

            &.dark {
                background-color: ${DARK_GOLD_COlOR};
            }

            &:hover {
                &.light {
                    background-color: ${shadeColor(LIGHT_GOLD_COLOR, -10)};
                }

                &.dark {
                    background-color: ${shadeColor(DARK_GOLD_COlOR, -10)};
                }
            }
        }

        th {
            padding: 5px 5px 10px 5px;
        }

        th.customer {
            width: 15%;
        }
        th.ims_circuit_id {
            width: 100px;
        }
        th.type {
            width: 100px;
        }
        td.impact-override {
            //padding: 100 0 0 5px;

            & div.impact-override__select {
                max-width: 170px;
            }

            & div.impact-override__text {
                width: 140px;
            }
        }
        td.ims-info {
            width: 40%;
        }

        // span {
        //     text-transform: uppercase;
        //     font-weight: bold;
        //     font-size: larger;
        //     color: ${MEDIUM_GREY_COLOR};
        //     padding: 7px 2px 7px 0;
        // }

        i.fa {
            float: right;
            margin-right: 15px;
            color: ${MEDIUM_GREY_COLOR};
            font-size: 18px;
        }

        tbody {
            td {
                word-break: break-word;
                word-wrap: break-word;
                padding: 15px 0 10px 5px;
                vertical-align: top;

                div.tool-tip {
                    span {
                        text-transform: none;

                        &.label {
                            font-weight: bold;
                            display: block;
                            padding: 3px 0;
                        }

                        &.value {
                            font-weight: normal;
                            float: right;
                            padding: 0 0 0 60px;
                        }
                    }
                }
            }
        }
        ${phoneMediaQuery(table_phone)}
    }
`;
