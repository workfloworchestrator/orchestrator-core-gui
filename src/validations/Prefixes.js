export function actionOptions(prefix, selectPrefix, statusProperty = "state" ) {
    //TODO scope on the context of logged in-user
    const select = {
        icon: "fa fa-search-plus",
        label: "select",
        action: selectPrefix
    };
    let options = [];
    const status = prefix[statusProperty];
    switch (status) {
        case 1:
            options = [];
            break;
        case 2:
            options = [];
            break;
        case 3: //Free
            options = [select];
            break;
        default :
            throw new Error(`Unknown status: ${status}`)
    }
    return options;
}

