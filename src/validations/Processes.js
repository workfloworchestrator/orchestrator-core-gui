export function actionOptions(process, showAction, retryAction, deleteAction, abortAction, statusProperty = "status" ) {
    //TODO scope on the context of logged in-user
    const details = {
        icon: "fa fa-search-plus",
        label: "details",
        action: showAction
    };
    const userInput = {
        icon: "fa fa-pencil-square-o",
        label: "user_input",
        action: showAction
    };
    const retry = {
        icon: "fa fa-refresh",
        label: "retry",
        action: retryAction
    };
    const _delete = {
        icon: "fa fa-trash",
        label: "delete",
        action: deleteAction,
        danger: true
    };
    const abort = {
        icon: "fa fa-window-close",
        label: "abort",
        action: abortAction,
        danger: true
    };
    let options = [];
    const status = process[statusProperty];
    switch (status) {
        case "failed":
            options = [details, retry, abort, _delete];
            break;
        case "aborted":
            options = [details, _delete];
            break;
        case "running": //??
            options = [abort, _delete];
            break;
        case "completed":
            options = [details, _delete];
            break;
        case "suspended":
            options = [userInput, abort, _delete];
            break;
        default :
            throw new Error(`Unknown status: ${status}`)
    }
    return options;
}

