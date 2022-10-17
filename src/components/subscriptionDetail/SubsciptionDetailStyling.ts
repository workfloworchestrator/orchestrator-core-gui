import { css } from "@emotion/core";
import { DANGER, LIGHT_GREY_COLOR, PRIMARY_COLOR, WARNING } from "stylesheets/emotion/colors";

export const subscriptionDetailStyling = css`
    .euiDescriptionList {
        a {
            margin-top: 15px;
        }
    }

    .mod-subscription-detail {
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

        section.product-block {
            section.product-block {
                padding-left: 20px;
            }
            h4 {
                font-weight: bold;
                margin: 10px 0 -15px 1em;
            }
        }

        section.terminate-link,
        section.modify-link {
            &.modify-link {
                margin-top: 25px;
            }
            a {
                margin-left: 25px;
                min-width: 320px;
                i {
                    margin-right: 30px;
                }
            }
            p.no-termination-reason,
            p.no-modify-reason {
                color: ${WARNING};
                margin: 15px 0 0 25px;
            }
        }
        section.terminate-link-waiting {
            margin-left: 25px;
            display: flex;
            align-items: center;
            em {
                font-size: 16px;
            }
            i.fa {
                color: ${WARNING};
            }
        }
        section.details {
            padding-bottom: 20px;
            > div {
                padding-left: 30px;
            }
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
                        &:nth-of-type(even) {
                        }
                        &:nth-of-type(odd) {
                            background: #f6f6f6;
                        }
                    }
                    &.dark {
                        border-bottom: 1px solid #141519;
                        border-left: 1px solid ${PRIMARY_COLOR};
                        &:nth-of-type(even) {
                        }
                        &:nth-of-type(odd) {
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

                    &:first-of-type {
                        width: 10%;
                    }
                    &:nth-of-type(2) {
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
                        &:nth-of-type(even) {
                        }
                        &:nth-of-type(odd) {
                            background: #f6f6f6;
                        }
                    }
                    &.dark {
                        border-bottom: 1px solid #141519;
                        border-left: 1px solid ${PRIMARY_COLOR};
                        &:nth-of-type(even) {
                        }
                        &:nth-of-type(odd) {
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
        }
        table.subscriptions {
            tr {
                &.light {
                    border-bottom: 1px solid ${LIGHT_GREY_COLOR};
                    border-left: 1px solid ${PRIMARY_COLOR};
                    &:nth-of-type(even) {
                    }
                    &:nth-of-type(odd) {
                        background: #f6f6f6;
                    }
                }
                &.dark {
                    border-bottom: 1px solid #141519;
                    border-left: 1px solid ${PRIMARY_COLOR};
                    &:nth-of-type(even) {
                    }
                    &:nth-of-type(odd) {
                        background: #141519;
                    }
                }
            }
            th,
            td {
                padding: 8px 15px;
                word-break: break-word;
                word-wrap: break-word;
            }
            th.customer_name {
                width: 20%;
            }
            th.subscription_id {
                width: 8%;
            }
            th.description {
                width: 20%;
            }
            th.insync {
                width: 10%;
                text-align: center;
            }
            th.product_name {
                width: 15%;
            }
            th.status {
                width: 8%;
            }
            th.tag {
                width: 10%;
            }
            th.start_date_epoch {
                width: 10%;
            }
            span {
                text-transform: uppercase;
                font-weight: bold;
                font-size: larger;
                padding: 7px 2px 7px 0;
            }
            tbody {
                td {
                    &.insync {
                        display: flex;
                        justify-content: center;
                    }
                }
            }
        }
        table.processes {
            tr {
                &.light {
                    border-bottom: 1px solid ${LIGHT_GREY_COLOR};
                    border-left: 1px solid ${PRIMARY_COLOR};
                    &:nth-of-type(even) {
                    }
                    &:nth-of-type(odd) {
                        background: #f6f6f6;
                    }
                }
                &.dark {
                    border-bottom: 1px solid #141519;
                    border-left: 1px solid ${PRIMARY_COLOR};
                    &:nth-of-type(even) {
                    }
                    &:nth-of-type(odd) {
                        background: #141519;
                    }
                }
            }
            th,
            td {
                padding: 8px 15px;
                word-break: break-word;
                word-wrap: break-word;
            }
            th.target {
                width: 10%;
            }
            th.name {
                width: 20%;
            }
            th.id {
                width: 28%;
            }
            th.started_at {
                width: 16%;
                text-align: center;
            }
            th.status {
                width: 9%;
            }
            th.modified_at {
                width: 16%;
            }
            span {
                text-transform: uppercase;
                font-weight: bold;
                font-size: larger;
                padding: 7px 2px 7px 0;
            }
            tbody {
                td {
                    &.insync {
                        display: flex;
                        justify-content: center;
                    }
                }
            }
        }
        p {
            margin-left: 25px;
            padding-top: 5px;
        }
        p.label {
            font-weight: bold;
            margin-left: 0px;
            padding-top: 5px;
        }
    }

    div.scrollable-tab-content {
        & > div.mod-subscription-detail {
            & > section.details {
                & > div {
                    padding-left: 25px;
                }

                & > h2 {
                    display: none;
                }
            }

            & > div.subscription-details {
                padding-left: 25px;
            }
        }
    }

    div.indented {
        padding-left: 25px;
    }

    section.tabbed-details {
        margin-top: 12px;

        &-in_use_by {
            min-height: 600px;
            margin-bottom: 2rem;

            & .scrollable-tab-content {
                max-height: 552px;
                overflow-y: scroll;
            }
        }
    }

    .euiTab {
        padding: 5px 5px 5px 5px;
    }
`;
