import { css } from "@emotion/core";
import { DANGER, SUCCESS } from "stylesheets/emotion/colors";

export const failedTaskBannerStyling = css`
    .failed-task-container {
        cursor: pointer;
    }
    .failed-task-banner {
        display: flex;
        align-items: center;

        &__icon {
            font-size: 175%;
            &.failed {
                color: ${DANGER};
            }
            &.ok {
                color: ${SUCCESS};
            }
        }

        &__counter {
            margin-left: 5px;
            margin-right: -15px;
        }
    }
`;
