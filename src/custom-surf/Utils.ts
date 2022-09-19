import moment from "moment";

export function renderStringAsDateTime(datetime: string, short: boolean = false) {
    if (short) {
        return moment(datetime).utc().zone(-240).format("Do MMM YYYY, HH:mm:ss");
    }
    return moment(datetime).zone(-240).format("dddd, MMMM Do YYYY, h:mm:ss a");
}
