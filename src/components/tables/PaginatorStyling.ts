import { css } from "@emotion/core";

export const paginatorStyling = css`
    .paginator {
        margin: 14px 0;
    }

    .euiPagination {
        height: 32px; // to align with the rows-per-page selector.
    }

    /* Style "rows per page" text */
    .euiButtonEmpty__text {
        font-size: 0.9em;
    }

    .mini-paginator {
        margin-top: 5px !important;
    }
`;
