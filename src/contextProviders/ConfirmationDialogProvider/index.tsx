import ConfirmationDialog from "components/modals/ConfirmationDialog";
import { createContext, useState } from "react";

const ConfirmationDialogContext = createContext({
    showConfirmDialog: (question: string, action: (e: React.MouseEvent) => void, leavePage: boolean = false) => {},
    cancelConfirmation: () => {},
});

export const ConfirmationDialogProvider = ConfirmationDialogContext.Provider;
export default ConfirmationDialogContext;

export function ConfirmationDialogContextWrapper({ children }: any) {
    const [confirmationDialogOpen, setCnfirmationDialogOpen] = useState(false);
    const [state, setState] = useState({
        confirmationDialogQuestion: "",
        confirmationDialogAction: (e: React.MouseEvent) => {},
        leavePage: false,
        isError: false,
    });
    const cancelConfirmation = () => setCnfirmationDialogOpen(false);

    const showConfirmDialog = (
        question: string,
        action: (e: React.MouseEvent) => void,
        leavePage: boolean = false,
        isError: boolean = false
    ) => {
        setCnfirmationDialogOpen(true);
        setState({
            confirmationDialogQuestion: question,
            leavePage,
            isError,
            confirmationDialogAction: (e: React.MouseEvent) => {
                cancelConfirmation();
                action(e);
            },
        });
    };

    return (
        <ConfirmationDialogProvider value={{ showConfirmDialog, cancelConfirmation }}>
            <ConfirmationDialog
                isOpen={confirmationDialogOpen}
                cancel={cancelConfirmation}
                confirm={state.confirmationDialogAction}
                question={state.confirmationDialogQuestion}
                leavePage={state.leavePage}
                isError={state.isError}
            />
            {children}
        </ConfirmationDialogProvider>
    );
}
