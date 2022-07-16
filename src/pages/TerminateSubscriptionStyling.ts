import { css } from "@emotion/core";

import { cardMixin } from "../stylesheets/emotion/mixins";

export const terminateSubscriptionsStyling = css`
    .mod-terminate-subscription {
        .card {
            ${cardMixin}
        }
    }
`;
