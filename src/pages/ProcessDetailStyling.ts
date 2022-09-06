import { css } from "@emotion/core";
import { DARKER_PRIMARY, DARK_GREY_COLOR, LIGHT_GREY_COLOR, PRIMARY_COLOR } from "stylesheets/emotion/colors";

export const processDetailStyling = css`
    .mod-process-detail {
        section.not-found {
            h1 {
                font-size: 24px;
                padding: 50px;
            }
        }
        section.tabs {
            display: flex;
            margin-top: 25px;
            padding: 0;
            span {
                text-align: center;
                cursor: pointer;
                padding: 15px 75px;
                background-color: ${LIGHT_GREY_COLOR};
                color: ${DARK_GREY_COLOR};
                text-transform: uppercase;
                border-right: 1px solid white;

                &.active {
                    background-color: white;
                    color: ${DARKER_PRIMARY};
                    border-top: 2px solid ${PRIMARY_COLOR};
                    border-right: none;
                }

                &:last-child {
                    border-right: none;
                }
            }
        }
        section.process-actions {
            display: flex;
            padding-top: 25px;
            a {
                margin-left: 40px;
                &:first-of-type {
                    margin-left: auto;
                }
            }
        }
    }

    .fixed_tab_menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        border-bottom: 3px solid ${DARKER_PRIMARY};
        background-color: ${LIGHT_GREY_COLOR};

        section.process-actions {
            padding: 5px 30px;
        }
    }
`;
