import cloneDeep from "lodash/cloneDeep";
import React from "react";
import { connectField, filterDOMProps } from "uniforms";

const ListAdd = ({ disabled, parent, value, ...props }: any) => {
    const limitNotReached = !disabled && !(parent.maxCount <= value.length);

    return (
        <div className="add-item" {...filterDOMProps(props)}>
            <i
                className={`fa fa-plus ${!limitNotReached ? "disabled" : ""}`}
                onClick={() => limitNotReached && parent.onChange(parent.value.concat([cloneDeep(value)]))}
            />
        </div>
    );
};

export default connectField(ListAdd, {
    includeParent: true,
    initialValue: false
});
