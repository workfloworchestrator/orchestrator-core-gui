import { css } from "@emotion/core";

export const maxSmallPhone = 400;
export const minTablet = 768;
export const minDesktop = 1024;

export function desktop() {
    return css`
        @media (min-width: #{${minDesktop}}) {
            @content;
        }
    `;
}

export function tablet() {
    return css`
        @media (min-width: #{${minTablet}}) {
            @content;
        }
    `;
}

export function phone(content) {
    return css`
        @media (max-width: ${minTablet - 1}px) {
            ${content}
        }
    `;
}

export function smallPhone() {
    return css`
        @media (max-width: #{${maxSmallPhone}} ) {
            @content;
        }
    `;
}
