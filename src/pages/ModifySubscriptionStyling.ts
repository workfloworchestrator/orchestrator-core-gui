import { css } from "@emotion/core";

import { cardMixin } from "../stylesheets/emotion/mixins";

export const modifySubscriptionsStyling = css`
    .mod-modify-subscription {
        .card {
            ${cardMixin}
        }
    }
`;
