import { Theme } from "utils/types";

export const DARK_ROW_BORDER_COLOR = "#555555";
export const LIGHT_ROW_BORDER_COLOR = "#cccccc";
export const DARK_BACKGROUND_COLOR = "#1D1E24";
export const LIGHT_BACKGROUND_COLOR = "#f6f6f6";
export const DARK_FONT_COLOR = "#ffffff";
export const LIGHT_FONT_COLOR = "#111111";
export const DARK_SELECTED_FONT_COLOR = "#0799fc";
export const LIGHT_SELECTED_FONT_COLOR = "#0077CCFF";

export function getReactSelectTheme(theme: Theme) {
    const seperatorColor = theme === "light" ? LIGHT_ROW_BORDER_COLOR : DARK_ROW_BORDER_COLOR;
    const backgroundColor = theme === "light" ? LIGHT_BACKGROUND_COLOR : DARK_BACKGROUND_COLOR;
    const fontColor = theme === "light" ? LIGHT_FONT_COLOR : DARK_FONT_COLOR;
    const selectedFontColor = theme === "light" ? LIGHT_SELECTED_FONT_COLOR : DARK_SELECTED_FONT_COLOR;

    const customStyles = {
        option: (provided: any, state: { isSelected: boolean; isDisabled: boolean }) => ({
            ...provided,
            borderBottom: `1px solid ${seperatorColor}`,
            backgroundColor: backgroundColor,
            color: state.isSelected ? selectedFontColor : fontColor,
            cursor: state.isDisabled ? "not-allowed" : "default",
        }),
        control: (provided: any) => ({
            ...provided,
            backgroundColor: backgroundColor,
            color: fontColor,
            border: `1px solid ${seperatorColor}`,
        }),
        input: (provided: any) => ({
            ...provided,
            color: fontColor,
        }),
        singleValue: (provided: any, state: { isDisabled: any }) => {
            const opacity = state.isDisabled ? 0.3 : 1;
            const transition = "opacity 300ms";
            return { ...provided, opacity, transition, color: fontColor };
        },
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: backgroundColor,
        }),
    };
    return customStyles;
}

export const getStatusBadgeColor = (status: string) => {
    const statusColors: any = {
        "end of life": "danger",
        active: "success",
        "phase out": "danger",
        "pre production": "warning",
    };
    return statusColors.hasOwnProperty(status) ? statusColors[status] : "primary";
};
