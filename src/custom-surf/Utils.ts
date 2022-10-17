import moment from "moment-timezone";

export function renderStringAsDateTime(datetime: string, short: boolean = false) {
    if (short) {
        return moment.utc(datetime).tz("Europe/Amsterdam").format("DD-MM-YYYY HH:mm");
    }
    return `${moment.utc(datetime).tz("Europe/Amsterdam").format("DD-MMM-YYYY HH:mm")} AMS (${moment
        .utc(datetime)
        .format("HH:mm")} UTC)`;
}
