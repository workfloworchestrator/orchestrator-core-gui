declare module "fetch-mock-jest" {
    import { FetchMockSandbox, FetchMockStatic, MockCall } from "fetch-mock";
    import { InspectionFilter, InspectionOptions } from "fetch-mock";

    interface FetchMockJestSandbox {
        sandbox(): jest.MockInstance<Response, MockCall> & FetchMockSandbox;
    }

    export type FetchMockJest = jest.MockInstance<Response, MockCall> & FetchMockJestSandbox & FetchMockStatic;

    const fetchMockJest: FetchMockJest;

    export default fetchMockJest;
}

declare namespace jest {
    interface Matchers<R, T> {
        toHaveFetched(filter?: InspectionFilter, options?: InspectionOptions): R;
        toHaveLastFetched(filter?: InspectionFilter, options?: InspectionOptions): R;
        toHaveNthFetched(n: number, filter?: InspectionFilter, options?: InspectionOptions): R;
        toHaveFetchedTimes(times: number, filter?: InspectionFilter, options?: InspectionOptions): R;
        toBeDone(filter?: InspectionFilter): R;
    }
}
