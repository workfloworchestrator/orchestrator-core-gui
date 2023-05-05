import { css } from "@emotion/core";
import { DARKER_PRIMARY, MEDIUM_GREY_COLOR, PRIMARY_COLOR } from "stylesheets/emotion/colors";

import { copyIconPulseMixin } from "../stylesheets/emotion/mixins";

export const processStateDetailsStyling = css`
    section.process-state-detail {
        padding: 15px 0 10px 0;
        pre {
            width: 100%;
        }

        span.copy-to-clipboard-container {
            color: ${PRIMARY_COLOR};
            display: inline-block;
            margin-bottom: 10px;

            button {
                background-color: transparent;
                border: none;
                cursor: pointer;
                font-size: larger;
            }
        }

        ${copyIconPulseMixin}

        section.header-information {
            display: flex;
            align-items: center;
            width: 100%;

            ul {
                list-style: none;
                h3 {
                    font-size: larger;
                    padding: 0 15px 0 3px;
                }
                li {
                    display: inline-block;
                    margin-right: 20px;
                    margin-bottom: 10px;
                }
                &:last-child {
                    margin-left: auto;
                }
            }
        }

        section.traceback-container {
            padding: 5px;
        }

        section.process-summary {
            margin: 0 0 0 0;
            padding: 20px 0 15px 0;
            table {
                td {
                    font-size: larger;
                    &.title {
                        padding: 3px 40px 3px 15px;
                        text-transform: uppercase;
                        font-weight: bold;
                    }
                }
            }
        }

        section.steps {
            display: flex;
            flex-direction: column;
            margin-left: 2%;

            .step-type {
                margin-left: 15px;
                margin-right: 15px;
            }

            .details-container {
                display: flex;
            }

            .step-container {
                cursor: pointer;
                display: flex;
                flex-direction: column;
                width: 180px;
                min-width: 180px;
                text-align: center;
                .step-divider {
                    i.fa {
                        font-size: 30px;
                        margin: 10px 0;
                        color: ${DARKER_PRIMARY};
                    }
                }
            }
            .state-changes {
                display: flex;

                section.state-delta {
                    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.15);
                    margin-bottom: 25px;
                    table {
                        td {
                            &.key {
                                text-transform: uppercase;
                                font-weight: bold;
                                color: ${MEDIUM_GREY_COLOR};
                                padding: 5px;
                                width: 125px;
                            }
                            &.value {
                                width: 800px;
                                min-width: 550px;
                                padding-left: 20px;
                                white-space: pre-wrap;
                            }
                            pre {
                                margin-left: -10px;
                            }
                        }
                    }
                    &.collapsed {
                        height: 110px;
                        overflow: scroll;
                        box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
                    }
                }

                i.fa {
                    font-size: 30px;
                    margin: 20px;
                    color: ${DARKER_PRIMARY};
                    &.fa-user {
                        margin-right: 30px;
                    }
                }
            }
        }
        section.subscription-link {
            width: 100%;
            a {
                margin: 12px 0;
            }
            i.fa {
                margin-right: 25px;
            }
        }
    }
`;
