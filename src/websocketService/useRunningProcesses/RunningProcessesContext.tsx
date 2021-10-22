import React from "react";

import useRunningProcesses, { RunningProcess } from ".";

interface RunningProcessesContextState {
    runningProcesses: RunningProcess[];
    useFallback: boolean;
}

const RunningProcessesContext = React.createContext<RunningProcessesContextState>({
    runningProcesses: [],
    useFallback: false,
});
export const RunningProcessesProvider = RunningProcessesContext.Provider;
export default RunningProcessesContext;

export function RunningProcessesContextWrapper({ children }: any) {
    const { runningProcesses, useFallback } = useRunningProcesses();

    return (
        <div>
            <RunningProcessesProvider value={{ runningProcesses, useFallback }}>{children}</RunningProcessesProvider>
        </div>
    );
}
