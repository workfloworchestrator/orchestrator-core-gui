import {paginatedSubscriptions} from "../api";

export const requestSubscriptionData = (pageSize, page, sorted, filtered) => {
    console.log(`Requesting data -> Page: ${page}, pageSize: ${pageSize}`);
    // console.log(filtered);
    // console.log(sorted);
    // Todo: log filter and sort OBJECTS also

    const filter_parameters = filtered.map(item => {return `${item.id},${item.value}`}).join(",")
    const sort_parameters = sorted.map(item => {return `${item.id},${item.desc ? "desc" : "asc"}`}).join(",")

    const paginate_query = `${page*(pageSize-1)},${pageSize-1+(page*(pageSize-1))}`;
    const sort_query = sorted.length > 0 ? sort_parameters : "";
    const filter_query = filtered.length > 0 ?  filter_parameters: "";

    return paginatedSubscriptions(paginate_query, sort_query, filter_query).then(results => {

        const res = {
            rows: results,
            pages: 99 // todo: get it from header
        };
        return res
    });

};
