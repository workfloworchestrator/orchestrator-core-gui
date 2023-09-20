import { css } from "@emotion/core";
import { DANGER, DARK_GOLD_COLOR, GOLD, PRIMARY_COLOR, SUCCESS, WARNING } from "stylesheets/emotion/colors";

export const processesStyling = css`
    table.nwa-table {
        tbody {
            td {
                i.fa-plus-circle,
                i.fa-minus-circle {
                    &.suspended {
                        color: ${GOLD};
                    }
                    &.running {
                        color: ${SUCCESS};
                    }
                    &.completed {
                        color: ${SUCCESS};
                    }
                    &.api_unavailable {
                        color: ${PRIMARY_COLOR};
                    }
                    &.inconsistent_data {
                        color: ${DANGER};
                    }
                    &.waiting {
                        color: ${WARNING};
                    }
                    &.awaiting_callback {
                        color: ${DARK_GOLD_COLOR};
                    }
                    &.failed {
                        color: ${DANGER};
                    }
                }
            }
            td.step {
                width: 15%;
            }
            td.actions {
                cursor: pointer;
                text-align: right;
                font-size: 18px;
                position: relative;
            }
            td.pid {
                width: 80px;
            }
        }
    }
`;
