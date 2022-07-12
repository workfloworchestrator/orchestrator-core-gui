import { css } from "@emotion/core";
import { DANGER, SUCCESS, WARNING } from "stylesheets/emotion/colors";

export const engineStatusBannerStyling = css`
    .engine-status-banner {
        margin: 0 16px;
        font-size: 0.9rem;
        font-weight: 500;
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif,
            "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";

        &__status {
            font-size: 115%;
            margin-left: 5px;
            &.paused {
                color: ${DANGER};
            }
            &.pausing {
                color: ${WARNING};
            }
            &.running {
                color: ${SUCCESS};
            }
        }
    }
`;
