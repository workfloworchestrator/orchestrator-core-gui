import { ReactWrapper } from "enzyme";
import { act } from "react-dom/test-utils";

test("Test suite must contain at least one test", () => {});

export default async function waitForComponentToPaint<P = {}>(wrapper: ReactWrapper<P>) {
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1));
        wrapper.update();
        await new Promise(resolve => setTimeout(resolve, 1));
        wrapper.update();
    });
}
