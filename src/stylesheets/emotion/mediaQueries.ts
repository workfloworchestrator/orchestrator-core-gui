import { css } from "@emotion/core";
import { SerializedStyles } from "@emotion/react";

export const maxSmallPhone = 400;
export const minTablet = 768;
export const minDesktop = 1024;

export function desktopMediaQuery(content: SerializedStyles) {
    return css`
        @media (min-width: ${minDesktop}px) {
            ${content}
        }
    `;
}

export function tabletMediaQuery(content: SerializedStyles) {
    return css`
        @media (min-width: ${minTablet}px) {
            ${content}
        }
    `;
}

export function phoneMediaQuery(content: SerializedStyles) {
    return css`
        @media (max-width: ${minTablet - 1}px) {
            ${content}
        }
    `;
}

export function smallPhoneMediaQuery(content: SerializedStyles) {
    return css`
        @media (max-width: ${maxSmallPhone}px) {
            ${content}
        }
    `;
}
