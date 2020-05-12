import React, { ReactNode } from "react";
import { connectField } from "uniforms";

import AutoField from "./AutoField";
import ListDelField from "./ListDelField";

export type ListItemFieldProps = {
    children: ReactNode;
    error?: boolean;
    showInlineError?: boolean;
    errorMessage?: string;
};

function ListItem({ children, error, showInlineError, errorMessage }: ListItemFieldProps) {
    return (
        <li>
            {children}
            <ListDelField name="" />
        </li>
    );
}

ListItem.defaultProps = { children: <AutoField label={null} name="" /> };

export default connectField(ListItem, { initialValue: false });
