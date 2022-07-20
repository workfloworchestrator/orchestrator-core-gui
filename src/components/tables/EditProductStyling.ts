import { css } from "@emotion/core";
import { DANGER, LIGHTEST_GREY, SUCCESS } from "stylesheets/emotion/colors";

export const editProductStyling = css`
    .mod-product {
        .card {
            padding: 10px 20px;
        }

        section.form-divider {
            border-bottom: 1px solid ${LIGHTEST_GREY};
            padding-bottom: 10px;
            margin-bottom: 15px;

            em {
                margin-bottom: 10px;
            }
        }

        div.product-block,
        div.fixed-input {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            div.wrapper {
                position: relative;
                flex-grow: 2;
                &:first-child {
                    margin-right: 25px;
                }
                em {
                    position: absolute;
                }
            }
            i.fa-minus {
                color: ${DANGER};
                margin-left: 20px;
                font-size: 32px;
                cursor: pointer;
                &.first {
                    padding-top: 22px;
                }
            }
        }

        div.add-fixed-input {
            display: flex;
            align-items: center;
            i.fa-plus {
                padding: 10px 2px 0 0;
                color: ${SUCCESS};
                font-size: 32px;
                cursor: pointer;
            }
        }

        .buttons {
            margin-top: 35px;
            display: flex;
            a.button.red {
                margin-left: auto;
            }
        }
    }
`;
