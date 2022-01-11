import { EngineSettingsContextWrapper } from "./engineSettingsProvider";
import { RunningProcessesContextWrapper } from "./runningProcessesProvider";

export default function GlobalContextProviders({ children }: any) {
    return (
        <RunningProcessesContextWrapper>
            <EngineSettingsContextWrapper>{children}</EngineSettingsContextWrapper>
        </RunningProcessesContextWrapper>
    );
}
