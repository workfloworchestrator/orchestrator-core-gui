import { ConfirmationDialogContextWrapper } from "./ConfirmationDialogProvider";
import { EngineSettingsContextWrapper } from "./engineSettingsProvider";
import { RunningProcessesContextWrapper } from "./runningProcessesProvider";

export default function GlobalContextProviders({ children }: any) {
    return (
        <RunningProcessesContextWrapper>
            <ConfirmationDialogContextWrapper>
                <EngineSettingsContextWrapper>{children}</EngineSettingsContextWrapper>
            </ConfirmationDialogContextWrapper>
        </RunningProcessesContextWrapper>
    );
}
