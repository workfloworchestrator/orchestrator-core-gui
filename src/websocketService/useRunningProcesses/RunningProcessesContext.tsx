import React from "react";

import useRunningProcesses, { RunningProcesses } from ".";

const RunningProcessesContext = React.createContext<RunningProcesses>({
    runningProcesses: [],
    completedProcessIds: [],
    useFallback: false,
});
export const RunningProcessesProvider = RunningProcessesContext.Provider;
export default RunningProcessesContext;

export function RunningProcessesContextWrapper({ children }: any) {
    const data = useRunningProcesses();

    return (
        <div>
            <RunningProcessesProvider value={data}>{children}</RunningProcessesProvider>
        </div>
    );
}
