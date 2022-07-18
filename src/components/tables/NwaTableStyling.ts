import { css } from "@emotion/core";
import { DANGER, DARK_GREY_COLOR, PRIMARY_COLOR, SUCCESS } from "stylesheets/emotion/colors";
import { infoIconMixin, toolTipMixin } from "stylesheets/emotion/mixins";

import { buttonsCss } from "../../stylesheets/emotion/buttons";

export const nwaTableStyling = css`
    ${buttonsCss}
    .table-preferences-icon-bar {
        padding: 20px 0 5px 0;
        margin: 0 0 5px 0;
        font-size: larger;
        .icon-right {
            float: right;
        }
        .table-name {
            font-weight: bold;
            color: ${DARK_GREY_COLOR};
            font-size: larger;
        }

        span {
            margin: 10px 5px 10px 0;
        }
        i.fa-cog {
            &.active {
                color: ${PRIMARY_COLOR};
            }
        }
    }
    div.advanced-search-container {
        padding: 0 0 10px 0;
    }

    .preferences {
        h1,
        h2 {
            margin-top: 10px;
        }
        label {
            display: inline-block;
            margin: 5px 10px 10px 0;
        }
        input {
            margin-top: -4px;
        }
        b {
            // styles the arrows of numeric input
            margin-top: 4px;
            margin-left: 1px;
        }
    }

    table.nwa-table {
        width: 100%;
        word-break: break-all;

        caption {
            font-weight: bold;
            font-variant: small-caps;
            font-size: larger;
        }
        td {
            text-align: left;
            vertical-align: middle;
        }
        th {
            text-align: left;
            vertical-align: middle;
            color: white;
        }
        th:first-of-type {
            border-radius: 10px 0 0 0;
        }
        th:last-child {
            border-radius: 0 10px 0 0;
            border-right: none;
        }
        tr {
            &.highlighted {
                border: 2px solid ${PRIMARY_COLOR};
            }
        }
        thead {
            tr.column-ids {
                th {
                    padding: 5px 5px 10px 5px;
                    background-color: ${PRIMARY_COLOR};
                }
            }
            span {
                font-weight: bold;
                font-size: larger;
                padding: 7px 2px 7px 0;
            }
            input {
                font-size: 14px;
            }
            tr.filters {
                th {
                    border-right: none;
                    border-left: none;

                    color: ${PRIMARY_COLOR};
                    input {
                        width: 99%;
                        height: 30px;
                        border: 0;
                    }
                    button.dropdown-button {
                        cursor: pointer;
                        border: 0;
                        background: transparent;
                        outline: none;

                        i.fa {
                            margin-top: 6px;
                            float: left;
                            font-size: 18px;
                            &.active {
                                color: ${DARK_GREY_COLOR};
                            }
                        }
                    }
                }
            }
        }
        tbody {
            td {
                i.fa-info-circle {
                    ${infoIconMixin}
                }
                word-break: break-word;
                word-wrap: break-word;
                padding: 15px 5px;

                div.tool-tip {
                    ${toolTipMixin}
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
                pre {
                    white-space: pre-wrap;
                }
            }
            td.assignee {
                font-weight: bold;
                padding-right: 15px;
            }
            td.highlight i.fa-caret-right {
                font-size: x-large;
            }
        }
        .info i.fa-caret-right {
            color: ${PRIMARY_COLOR};
            margin-left: -12px;
            padding-right: 6px;
        }
    }

    .no-results {
        font-weight: bold;
        font-variant: small-caps;
        margin: 0 0 0 2em;
        font-size: large;
    }
    .pagination {
        margin: 8px 0 10px 0;
    }

    #filter_headers_info {
        cursor: pointer;
    }

    span.pulse {
        color: ${SUCCESS};
    }

    span.rest {
        color: ${SUCCESS};
    }

    span.dead {
        color: ${DANGER};
    }
`;
