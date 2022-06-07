import {
    DARK_BACKGROUND_COLOR,
    DARK_FONT_COLOR,
    DARK_ROW_BORDER_COLOR,
    DARK_SELECTED_FONT_COLOR,
    LIGHT_BACKGROUND_COLOR,
    LIGHT_FONT_COLOR,
    LIGHT_ROW_BORDER_COLOR,
    LIGHT_SELECTED_FONT_COLOR,
} from "stylesheets/emotion/colors";
import { Theme } from "utils/types";

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

export function shadeColor(color: string, percent: number) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(String((R * (100 + percent)) / 100));
    G = parseInt(String((G * (100 + percent)) / 100));
    B = parseInt(String((B * (100 + percent)) / 100));

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    const RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
    const GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
    const BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

    return "#" + RR + GG + BB;
}
