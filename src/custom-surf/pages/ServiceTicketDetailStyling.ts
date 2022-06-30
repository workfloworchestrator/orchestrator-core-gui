import { css } from "@emotion/core";
import {
    DANGER,
    LIGHTER_GREY_COLOR,
    LIGHT_GREY_COLOR,
    LIGHT_PRIMARY_COLOR,
    MEDIUM_GREY_COLOR,
    PRIMARY_COLOR,
} from "stylesheets/emotion/colors";
import { phoneMediaQuery } from "stylesheets/emotion/mediaQueries";

const table_phone = css`
    thead {
        display: none;
    }
    tr {
        margin-bottom: 10px;
        display: block;
        border-bottom: 2px solid ${LIGHTER_GREY_COLOR};
    }
    td {
        display: block;
        text-align: right;
        border-bottom: 1px dotted ${LIGHT_PRIMARY_COLOR};
        padding: 8px 0;

        &:before {
            content: attr(data-label);
            float: left;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 14px;
            color: ${MEDIUM_GREY_COLOR};
        }
    }
`;

export const ticketDetail = css`
    .tabbed-logitems-parent {
        .scrollable-tab-content {
            margin-top: 10px;
            max-height: 500px;
            overflow-y: scroll;
        }
    }
    .mod-ticket-detail {
        h2 {
            font-size: 20px;
            padding: 15px 0 0 15px;
        }
        h3 {
            font-size: 18px;
            margin: 10px 0 0 0;
            padding: 10px 0 0 0;
        }
        em {
            margin-left: 15px;
        }
        dl {
            display: flex;
            flex-wrap: wrap;
        }
        dt {
            width: 33%;
        }
        dd {
            margin-left: auto;
            width: 66%;
        }
        section.not-found-related-objects {
            padding-bottom: 20px;
            h3 {
                color: ${DANGER};
            }
        }
        table {
            table-layout: fixed;
            margin-top: 20px;
            width: 100%;
            word-break: break-all;

            td,
            th {
                text-align: left;
            }
        }
        table.detail-block {
            &.related-subscription {
                margin: 0;
                width: 100%;
            }
            thead {
                th {
                    padding: 5px 0 10px;
                    &.insync {
                        width: 10%;
                    }
                }
            }
            tbody {
                tr {
                    &.light {
                        border-bottom: 1px solid ${LIGHT_GREY_COLOR};
                        border-left: 1px solid ${PRIMARY_COLOR};
                        &:nth-child(even) {
                        }
                        &:nth-child(odd) {
                            background: #f6f6f6;
                        }
                    }
                    &.dark {
                        border-bottom: 1px solid #141519;
                        border-left: 1px solid ${PRIMARY_COLOR};
                        &:nth-child(even) {
                        }
                        &:nth-child(odd) {
                            background: #141519;
                        }
                    }
                }
                td {
                    vertical-align: middle;
                    padding: 8px 15px;
                    em.error {
                        margin-left: 0;
                        font-size: 14px;
                    }
                    div.resource-type {
                        display: flex;
                    }

                    &:first-child {
                        width: 10%;
                    }
                    &:nth-child(2) {
                        width: 50%;
                        text-align: left;
                        div.checkbox {
                            display: inline;
                            margin: 15px 15px 0 0;
                        }
                    }
                    &:last-child {
                        width: 30%;
                    }
                    &.insync {
                        text-align: center;
                    }

                    i.fa-plus-circle,
                    i.fa-minus-circle {
                        cursor: pointer;
                        margin-right: 15px;
                        font-size: 22px;
                        color: ${PRIMARY_COLOR};
                    }
                }
            }
            &.multiple-tbody {
                tbody {
                    &.light {
                        border-bottom: 1px solid ${LIGHT_GREY_COLOR};
                        border-left: 1px solid ${PRIMARY_COLOR};
                        &:nth-child(even) {
                        }
                        &:nth-child(odd) {
                            background: #f6f6f6;
                        }
                    }
                    &.dark {
                        border-bottom: 1px solid #141519;
                        border-left: 1px solid ${PRIMARY_COLOR};
                        &:nth-child(even) {
                        }
                        &:nth-child(odd) {
                            background: #141519;
                        }
                    }
                    tr.related-subscription {
                        border-bottom: none;
                        border-left: none;
                        td {
                            &.whitespace {
                                border-left: none;
                            }
                            &.related-subscription-values {
                                border-bottom: 1px solid ${LIGHT_GREY_COLOR};
                                border-left: 5px solid ${PRIMARY_COLOR};
                                margin: 0;
                                padding: 0;
                            }
                        }
                    }
                }
            }
            ${phoneMediaQuery(table_phone)}
        }
    }
`;
