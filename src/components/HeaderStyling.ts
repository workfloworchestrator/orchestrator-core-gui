import { css } from "@emotion/core";
import { DANGER } from "stylesheets/emotion/colors";

export const headerStyling = css`
    .euiHeader {
        min-height: 80px;
    }

    .header {
        &__app-title {
            margin: 0;
            font-size: 1.4rem !important;
            font-weight: normal !important;
            padding-left: 0.5rem;
            &.staging,
            &.local,
            &.development {
                color: ${DANGER};
                margin-top: 0.26rem !important;
                padding-left: 0.65rem;
                font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif,
                    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                font-size: 1.1rem !important;
            }
        }
        &__logo-img {
            padding-left: 0.2rem;
            padding-right: 0.5rem;
            margin-top: 1rem;
            width: 6rem;
            height: 60px;

            &.dark {
                -webkit-filter: invert(100%); /* safari 6.0 - 9.0 */
                filter: invert(100%);
            }
        }
    }
    #switchTheme {
        margin-right: -20px;
    }

    .flash.hide + div.header-container {
        .header {
            margin: 0 auto;
            transition: margin-top 500ms ease-in-out;
        }
    }
`;
