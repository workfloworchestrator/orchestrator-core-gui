import en from "locale/en";
import { merge } from "lodash";
import { createIntl, createIntlCache } from "react-intl";
import { apiClient } from "utils/ApplicationContext";

async function loadLocaleData(locale: string): Promise<Record<string, string>> {
    let backend_messages;
    try {
        backend_messages = {};
        // circular import
        backend_messages = await apiClient.translations(locale);
    } catch (e) {
        backend_messages = {};
    }

    let messages;
    switch (locale) {
        case "nl-NL":
            messages = await import("locale/nl");
            break;
        case "en-GB":
            messages = en;
            break;
        default:
            messages = en;
            break;
    }

    messages = merge(backend_messages, messages);

    return parse_translations_dict(messages);
}

function parse_from_object(
    results: { [index: string]: string },
    prefix: string,
    data: { [index: string]: string | any }
) {
    for (const [id, msg] of Object.entries(data)) {
        var prefixed_id = prefix ? prefix + "." + id : id;

        if (typeof msg === "object" && msg !== null) {
            parse_from_object(results, prefixed_id, msg);
        } else {
            results[prefixed_id] = msg.replace(/\{\{/g, "{").replace(/\}\}/g, "}");
        }
    }
}

export function parse_translations_dict(data: {}) {
    const results = {};
    parse_from_object(results, "", data);

    return results;
}

// This is optional but highly recommended
// since it prevents memory leak
const cache = createIntlCache();

// Create the `intl` object
// TODO get rid of this global
export let intl = createIntl(
    {
        // Locale of the application
        locale: "en-GB",
        // Locale of the fallback defaultMessage
        defaultLocale: "en-GB",
        messages: parse_translations_dict(en),
        onError: (_) => {},
    },
    cache
);

export async function setLocale(locale: string) {
    intl = createIntl(
        {
            // Locale of the application
            locale: locale,
            // Locale of the fallback defaultMessage
            defaultLocale: "en-GB",
            messages: await loadLocaleData(locale),
            onError: (error) => {
                console.log(error);
            },
        },
        cache
    );

    return intl;
}
