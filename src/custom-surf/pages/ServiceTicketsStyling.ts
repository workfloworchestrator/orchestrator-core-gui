import { css } from "@emotion/core";
import {
    DARKEST_PRIMARY_COLOR,
    DARK_GOLD_COlOR,
    DARK_GREY_COLOR,
    DARK_SUCCESS_COLOR,
    LIGHTER_GREY_COLOR,
    LIGHT_GOLD_COLOR,
    LIGHT_GREY_COLOR,
    LIGHT_PRIMARY_COLOR,
    LIGHT_SUCCESS_COLOR,
    MEDIUM_GREY_COLOR,
} from "stylesheets/emotion/colors";
import { phoneMediaQuery } from "stylesheets/emotion/mediaQueries";
import { shadeColor } from "stylesheets/emotion/utils";

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

export const tableTickets = css`
    table.tickets {
        width: 100%;
        word-break: break-all;

        td,
        th {
            text-align: left;
            vertical-align: middle;
        }

        td.jira_ticket_id {
            cursor: pointer;
        }

        tr {
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

        tr.updated {
            &.light {
                background-color: ${LIGHT_PRIMARY_COLOR};
            }

            &.dark {
                background-color: ${DARKEST_PRIMARY_COLOR};
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

        tr.open_related,
        tr.open_accepted {
            cursor: default;

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

        tr.open {
            &.light {
                background-color: ${LIGHT_SUCCESS_COLOR};
            }

            &.dark {
                background-color: ${DARK_SUCCESS_COLOR};
            }

            &:hover {
                &.light {
                    background-color: ${shadeColor(LIGHT_SUCCESS_COLOR, -10)};
                }

                &.dark {
                    background-color: ${shadeColor(DARK_SUCCESS_COLOR, -10)};
                }
            }
        }

        tr.updated {
            &.light {
                background-color: ${LIGHT_PRIMARY_COLOR};
            }

            &.dark {
                background-color: ${DARKEST_PRIMARY_COLOR};
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

        th {
            padding: 5px 5px 10px 5px;
        }

        th.jira_ticket_id {
            width: 14%;
        }
        th.title_nl {
            width: 25%;
        }
        th.ticket_state {
            width: 10%;
        }
        th.process_state {
            width: 10%;
        }
        th.opened_by {
            width: 10%;
        }
        th.start_date {
            width: 12%;
        }
        th.create_date {
            width: 12%;
        }

        span {
            text-transform: uppercase;
            font-weight: bold;
            font-size: larger;
            color: ${MEDIUM_GREY_COLOR};
            padding: 7px 2px 7px 0;
        }

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
