import {paginatedSubscriptions} from "../api";

export const requestSubscriptionData = (pageSize, page, sorted, filtered) => {
    console.log(`Requesting data -> Page: ${page}, pageSize: ${pageSize}`);
    console.log(filtered);
    console.log(sorted);
    // Todo: log filter and sort OBJECTS also

    const paginate_query = `${page*(pageSize-1)},${pageSize-1+(page*(pageSize-1))}`;
    const sort_query = sorted.length > 0 ? `${sorted[0].id},${sorted[0].desc ? "desc" : "asc"}` : "";
    const filter_query = filtered.length > 0 ? `${filtered[0].id},${filtered[0].value}` : "";

    return paginatedSubscriptions(paginate_query, sort_query, filter_query).then(results => {

        const res = {
            rows: results,
            pages: 20 // todo: get it from header
        };
        return res
    });

};
