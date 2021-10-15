import React from "react";

import useRunningProcesses, { RunningProcess } from ".";

interface RunningProcessesContextState {
    runningProcesses: RunningProcess[];
}

const RunningProcessesContext = React.createContext<RunningProcessesContextState>({
    runningProcesses: [],
});
export const RunningProcessesProvider = RunningProcessesContext.Provider;
export default RunningProcessesContext;

export function RunningProcessesContextWrapper({ children }: any) {
    const { runningProcesses } = useRunningProcesses();

    return (
        <div>
            <RunningProcessesProvider value={{ runningProcesses }}>{children}</RunningProcessesProvider>
        </div>
    );
}
