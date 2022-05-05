import { css } from '@emotion/core';
import { lighterGrey, lightPrimary, mediumGrey } from '../../vars'
import { phone } from "../../stylesheets/media_queries";

export const mediaQueriesPhone = css`
  thead {
    display: none;
    color: red;
  }
  tr {
    margin-bottom: 10px;
    display: block;
    border-bottom: 2px solid ${lighterGrey};
  }
  td {
    display: block;
    text-align: right;
    border-bottom: 1px dotted ${lightPrimary};
    padding: 8px 0;

    &:before {
      content: attr(data-label);
      float: left;
      text-transform: uppercase;
      font-weight: bold;
      font-size: 14px;
      color: ${mediumGrey};
    }
  }
`;

