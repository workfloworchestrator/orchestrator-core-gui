import { RunningProcessesContextWrapper } from "./runningProcessesProvider";

import { EngineSettingsContextWrapper } from "./engineSettingsProvider";

export default function GlobalContextProviders({ children }: any) {
    return (
        <RunningProcessesContextWrapper>
            <EngineSettingsContextWrapper>{children}</EngineSettingsContextWrapper>
        </RunningProcessesContextWrapper>
    );
}
