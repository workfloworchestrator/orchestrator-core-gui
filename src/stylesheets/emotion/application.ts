import { css } from "@emotion/core";

import { robotoCss } from "../fonts/roboto";
import { baseCss } from "./base";
import { loaderCss } from "./loader";

export const applicationCss = css`
    ${baseCss}
    ${loaderCss}
  ${robotoCss}
`;
