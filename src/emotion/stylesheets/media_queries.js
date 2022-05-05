import { css } from '@emotion/core';

export const minDesktop = '1024px';
export const minTablet = '768px';
export const maxSmallPhone = '400px';

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

export function phone() {
  return css`
    @media (max-width: #{${minTablet} - 1px} ) {
      @content;
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
