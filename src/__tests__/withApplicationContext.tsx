import React from "react";
import ApplicationContext, { ApplicationContextInterface } from "utils/ApplicationContext";

test("Test suite must contain at least one test", () => {});

// See https://github.com/enzymejs/enzyme/issues/2073#issuecomment-565736674
export default function withApplicationContext(
    component: JSX.Element,
    appContext: Partial<ApplicationContextInterface> = {}
) {
    return (
        <ApplicationContext.Provider value={appContext as ApplicationContextInterface}>
            {component}
        </ApplicationContext.Provider>
    );
}
