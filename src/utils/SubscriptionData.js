import {subscriptions} from "../api";

export const requestSubscriptionData = (pageSize, page, sorted, filtered) => {
    console.log(`Requesting data -> Page: ${page}, pageSize: ${pageSize}`);
    console.log(filtered);
    console.log(sorted);
    // Todo: log filter and sort OBJECTS also

    return subscriptions(`${page*(pageSize-1)},${pageSize+(page*(pageSize-1))}`).then(results => {

        const res = {
            rows: results,
            pages: 20 // todo: get it from header
        };
        return res
    });

};
