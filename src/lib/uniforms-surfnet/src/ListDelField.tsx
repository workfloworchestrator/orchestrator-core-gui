import React from "react";
import { connectField, filterDOMProps } from "uniforms";

const ListDel = ({ disabled, name, parent, ...props }: any) => {
    const fieldIndex = +name.slice(1 + name.lastIndexOf("."));
    const limitNotReached = !disabled && !(parent.minCount >= parent.value.length);

    return (
        <i
            className={`fa fa-minus ${!limitNotReached ? "disabled" : ""}`}
            {...filterDOMProps(props)}
            onClick={() =>
                limitNotReached &&
                parent.onChange([].concat(parent.value.slice(0, fieldIndex)).concat(parent.value.slice(1 + fieldIndex)))
            }
        />
    );
};

export default connectField(ListDel, {
    includeParent: true,
    initialValue: false
});
