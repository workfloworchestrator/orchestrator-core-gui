import { css } from "@emotion/core";

import { phone } from "../../stylesheets/media_queries";
import {
    darkGold,
    darkGrey,
    darkSuccess,
    darkestPrimary,
    hover,
    lightGold,
    lightGrey,
    lightPrimary,
    lightSuccess,
    lighterGrey,
    mediumGrey,
} from "../../vars";

const table_phone = css`
    thead {
        display: none;
    }
    tr {
        margin-bottom: 10px;
        display: block;
        border-bottom: 2px solid ${lighterGrey};
    }
    td {
        display: block;
        text-align: right;
        border-bottom: 1px dotted ${lightPrimary};
        padding: 8px 0;

        &:before {
            content: attr(data-label);
            float: left;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 14px;
            color: ${mediumGrey};
        }
    }
`;

export const tablePrefixes = css`
    table.prefixes {
        width: 100%;
        word-break: break-all;

        td,
        th {
            text-align: left;
            vertical-align: middle;
        }

        tr {
            &.light {
                border-bottom: 1px solid ${lightGrey};
            }

            &.dark {
                border-bottom: 1px solid ${darkGrey};
            }
        }

        tr.Allocated {
            &.light {
                background-color: ${lightPrimary};
            }

            &.dark {
                background-color: ${darkestPrimary};
            }

            //TODO:
            &:hover {
                &.light {
                    background-color: color .adjust(${lightPrimary}, $lightness: -10%);
                }

                &.dark {
                    background-color: color .adjust(${darkestPrimary}, $lightness: -10%);
                }
            }
        }

        tr.Planned {
            cursor: default;

            &.light {
                background-color: ${lightGold};
            }

            &.dark {
                background-color: ${darkGold};
            }

            &:hover {
                &.light {
                    background-color: color .adjust(${lightGold}, $lightness: -10%);
                }

                &.dark {
                    background-color: color .adjust(${darkGold}, $lightness: -10%);
                }
            }
        }

        tr.Free {
            &.light {
                background-color: ${lightSuccess};
            }

            &.dark {
                background-color: ${darkSuccess};
            }

            &:hover {
                &.light {
                    background-color: color .adjust(${lightSuccess}, $lightness: -10%);
                }

                &.dark {
                    background-color: color .adjust(${darkSuccess}, $lightness: -10%);
                }
            }
        }

        th {
            padding: 5px 5px 10px 5px;
        }

        th.customer {
            width: 15%;
        }

        th.sub_id {
            width: 7%;
        }

        th.description {
            width: 20%;
        }

        th.fam {
            width: 5%;
        }

        th.len {
            width: 5%;
        }

        th.prefix {
            width: 14%;
        }

        th.parent {
            width: 14%;
        }

        th.status {
            width: 10%;
        }

        th.start_date {
            width: 10%;
        }

        span {
            text-transform: uppercase;
            font-weight: bold;
            font-size: larger;
            color: ${mediumGrey};
            padding: 7px 2px 7px 0;
        }

        i.fa {
            float: right;
            margin-right: 15px;
            color: ${mediumGrey};
            font-size: 18px;
        }

        tbody {
            tr {
                &:hover {
                    background-color: ${hover};

                    &.Planned {
                        background-color: color.adjust(${lightGold}, $lightness: -10%);
                    }

                    &.Free {
                        background-color: color.adjust(${lightSuccess}, $lightness: -10%);
                    }

                    &.Allocated {
                        //color.adjust seems to not work with emotion shoud we user rgba() ?
                        //background-color: ${lightPrimary}
                        background-color: rgba(203, 231, 251, 0.1);
                    }
                }
            }

            td {
                i.fa-info-circle {
                    @include mixins . info-icon;
                }

                word-break: break-word;
                word-wrap: break-word;
                padding: 15px 0 10px 5px;

                div.tool-tip {
                    @include mixins . tool-tip;

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
        ${phone(table_phone)}
    }
`;
