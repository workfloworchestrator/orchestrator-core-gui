export const SUBSCRIPTION_VIEWTYPE_SELECTOR = "subscription-viewtype";

export interface StoredViewPreferences {
    viewType: string;
    tabViewId: string;
}

export interface TabView {
    id: string;
    name: string;
    href?: string;
    content: React.ReactNode;
    append?: string;
    prepend?: string;
    disabled: boolean;
}
