import ConfirmationDialog from "components/modals/ConfirmationDialog";
import { createContext, useState } from "react";

export interface ShowConfirmDialog {
    question: string;
    confirmAction: (e: React.MouseEvent) => void;
    cancelAction?: (e: React.MouseEvent) => void;
    leavePage?: boolean;
    isError?: boolean;
}

export type ShowConfirmDialogType = ({
    question,
    confirmAction,
    cancelAction,
    leavePage,
    isError,
}: ShowConfirmDialog) => void;

export interface ConfirmDialogActions {
    showConfirmDialog: ShowConfirmDialogType;
    cancelConfirmDialog: () => void;
}

const ConfirmationDialogContext = createContext<ConfirmDialogActions>({
    showConfirmDialog: () => {},
    cancelConfirmDialog: () => {},
});

export const ConfirmationDialogProvider = ConfirmationDialogContext.Provider;
export default ConfirmationDialogContext;

export function ConfirmationDialogContextWrapper({ children }: any) {
    const [confirmationDialogOpen, setCnfirmationDialogOpen] = useState(false);
    const [state, setState] = useState({
        confirmationDialogQuestion: "",
        confirmationDialogAction: (e: React.MouseEvent) => {},
        cancelConfirmDialogAction: (e: React.MouseEvent) => {},
        leavePage: false,
        isError: false,
    });
    const cancelConfirmDialog = () => setCnfirmationDialogOpen(false);

    const showConfirmDialog = ({ question, confirmAction, cancelAction, leavePage, isError }: ShowConfirmDialog) => {
        setCnfirmationDialogOpen(true);
        setState({
            confirmationDialogQuestion: question,
            leavePage: !!leavePage,
            isError: !!isError,
            confirmationDialogAction: (e: React.MouseEvent) => {
                cancelConfirmDialog();
                confirmAction(e);
            },
            cancelConfirmDialogAction: (e: React.MouseEvent) => {
                cancelConfirmDialog();
                if (cancelAction) cancelAction(e);
            },
        });
    };

    return (
        <ConfirmationDialogProvider value={{ showConfirmDialog, cancelConfirmDialog }}>
            <ConfirmationDialog
                isOpen={confirmationDialogOpen}
                cancel={state.cancelConfirmDialogAction}
                confirm={state.confirmationDialogAction}
                question={state.confirmationDialogQuestion}
                leavePage={state.leavePage}
                isError={state.isError}
            />
            {children}
        </ConfirmationDialogProvider>
    );
}
