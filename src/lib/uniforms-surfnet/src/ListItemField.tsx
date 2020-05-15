import React, { Children, ReactNode, cloneElement } from "react";
import { connectField, joinName } from "uniforms";

import AutoField from "./AutoField";
import ListDelField from "./ListDelField";

export type ListItemFieldProps = {
    children?: ReactNode;
    label: null | string;
    name: string;
    error?: boolean;
    showInlineError?: boolean;
    errorMessage?: string;
};

export function ListItem(props: ListItemFieldProps) {
    return (
        <li>
            {props.children ? (
                Children.map(props.children as JSX.Element, child =>
                    cloneElement(child, {
                        name: joinName(props.name, child.props.name),
                        label: null
                    })
                )
            ) : (
                <AutoField {...props} />
            )}
            <ListDelField name={props.name} />
        </li>
    );
}

export default connectField(ListItem, {
    includeInChain: false,
    includeParent: true
});
