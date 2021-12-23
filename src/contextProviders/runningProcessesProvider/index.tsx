import React from "react";
import useRunningProcesses, { RunningProcesses } from "websocketService/useRunningProcesses";

const RunningProcessesContext = React.createContext<RunningProcesses>({
    runningProcesses: [],
    completedProcessIds: [],
    useFallback: false,
});

export const RunningProcessesProvider = RunningProcessesContext.Provider;
export default RunningProcessesContext;

export function RunningProcessesContextWrapper({ children }: any) {
    const data = useRunningProcesses();

    return <RunningProcessesProvider value={data}>{children}</RunningProcessesProvider>;
}
