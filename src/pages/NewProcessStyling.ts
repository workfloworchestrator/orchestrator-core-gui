import { css } from "@emotion/core";

import { cardMixin } from "../stylesheets/emotion/mixins";

export const newProcessStyling = css`
    .mod-new-process {
        .card {
            ${cardMixin}
        }
    }
`;
