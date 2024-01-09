import { css } from "@emotion/core";

import { SIZE_BORDER_RADIUS } from "../../../stylesheets/emotion/vars";

export const autocompleteStyling = css`
    .autocomplete-container {
        position: relative;
    }

    section.autocomplete {
        z-index: 2000;
        top: 100%;
        width: 100%;
        border-radius: ${SIZE_BORDER_RADIUS};
        background-color: #787878;
        margin-bottom: 25px;

        div.no-results {
            padding: 10px 15px;
            font-style: italic;
        }

        table.result {
            width: 100%;
            word-break: break-all;
            z-index: 2000;

            tbody tr {
                cursor: pointer;

                td {
                    padding: 10px;
                    width: 50%;
                    vertical-align: middle;
                    span.matched {
                        font-weight: bold;
                        text-decoration: underline;
                    }
                }
            }
        }
    }
`;
