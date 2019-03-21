import {subscriptions} from "../api";

export const requestSubscriptionData = (pageSize, page, sorted, filtered) => {
    console.log(`Requesting data -> Page: ${page}, pageSize: ${pageSize}`);
    console.log(filtered);
    console.log(sorted);
    // Todo: log filter and sort OBJECTS also

    return subscriptions(`0,${pageSize}`).then(results => {

        const res = {
            rows: results,
            pages: 3
        };
        return res
    });

};
