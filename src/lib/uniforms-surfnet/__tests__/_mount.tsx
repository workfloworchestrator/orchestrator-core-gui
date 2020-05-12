import { mount as enzyme } from "enzyme";
import { ReactElement } from "react";
import { context } from "uniforms";

test("Test suite must contain at least one test", () => {});

function mount(node: ReactElement, options: any) {
    if (options === undefined) return enzyme(node);
    return enzyme(node, {
        wrappingComponent: context.Provider,
        wrappingComponentProps: { value: options.context }
    });
}

export default mount as typeof enzyme;
