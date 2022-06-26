import { css } from "@emotion/core";
import { DANGER, LIGHTEST_GREY } from "stylesheets/emotion/colors";

export const productBlockStyling = css`
    .mod-product-block {
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

        div.resource-type {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            i.fa-minus {
                color: ${DANGER};
                margin-left: 20px;
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
