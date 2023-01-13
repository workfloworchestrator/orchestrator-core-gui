import moment, { Moment } from "moment-timezone";

const LOCAL_TZ = "Europe/Amsterdam"; // Corresponds to `LOCAL_TZ` in AppSettings.LOCAL_TZ in cim

// Date formatting definitions - keep in sync with cim/domain/dates.py
const MOMENTJS_DATETIME_LONG = "DD-MMM-YYYY HH:mm z"; // 12-May-2022 00:00 CEST
const MOMENTJS_DATETIME_SHORT = "DD-MM-YYYY HH:mm"; // 12-05-2022 00:00

const UTC_DATETIME_SHORT = "HH:mm z"; // 22:00 UTC
const UTC_DATETIME_LONG = "DD-MMM HH:mm z"; // 11-May 22:00 UTC

export function utcTimestampToLocalMoment(utc_timestamp: number) {
    return moment.unix(utc_timestamp).tz(LOCAL_TZ);
}

export function localMomentToUtcTimestamp(local_moment: Moment) {
    return local_moment.unix();
}

function renderMoment(utc_moment: Moment, short: boolean) {
    /** Render Moment object as a datetime string.
     *
     * Keep function in sync with cim/domain/dates.py/render_datetime()
     */
    if (short) {
        return utc_moment.tz(LOCAL_TZ).format(MOMENTJS_DATETIME_SHORT);
    }

    // Backup original object because .tz() will modify it
    const _utc = utc_moment.clone();
    const local_moment = utc_moment.tz(LOCAL_TZ);

    // Format UTC time with date/month if it falls on a different day, otherwise use short format
    const utc = _utc.date() == local_moment.date() ? _utc.format(UTC_DATETIME_SHORT) : _utc.format(UTC_DATETIME_LONG);
    return `${local_moment.format(MOMENTJS_DATETIME_LONG)} (${utc})`;
}

export function renderIsoDatetime(iso_datetime: string, short: boolean = false) {
    // Parse an ISO formatted datetime and render as a datetime string.
    return renderMoment(moment.utc(iso_datetime, true), short);
}
