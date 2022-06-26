import { css } from "@emotion/core";

import { cardMixin } from "../stylesheets/emotion/mixins";

export const newTaskStyling = css`
    .mod-new-task {
        .card {
            ${cardMixin}
        }
    }
`;
