import { BaseApiClient } from "api";
import { intl } from "locale/i18n";
import { setFlash } from "utils/Flash";
import { Organization, ServicePortSubscription } from "utils/types";

abstract class CustomApiClientInterface extends BaseApiClient {
    abstract portSubscriptions: (
        tagList?: string[],
        statusList?: string[],
        productList?: string[]
    ) => Promise<ServicePortSubscription[]>;
    abstract organisations: () => Promise<Organization[] | undefined>;
    abstract locationCodes: () => Promise<string[] | undefined>;
}

export class CustomApiClient extends CustomApiClientInterface {
    portSubscriptions = (
        tagList: string[] = [],
        statusList: string[] = [],
        productList: string[] = []
    ): Promise<ServicePortSubscription[]> => {
        const statusFilter = `statuses,${encodeURIComponent(statusList.join("-"))}`;
        const tagsFilter = `tags,${encodeURIComponent(tagList.join("-"))}`;
        const productsFilter = `products,${encodeURIComponent(productList.join("-"))}`;

        const params = new URLSearchParams();
        const filters = [];
        if (tagList.length) filters.push(tagsFilter);
        if (statusList.length) filters.push(statusFilter);
        if (productList.length) filters.push(productsFilter);

        if (filters.length) params.set("filter", filters.join(","));

        return this.fetchJson(`surf/subscriptions/ports${filters.length ? "?" : ""}${params.toString()}`);
    };

    organisations = (): Promise<Organization[] | undefined> => {
        //@ts-ignore
        return this.fetchJson("surf/crm/organisations", {}, {}, false).catch(() => {
            setTimeout(() => {
                setFlash(
                    intl.formatMessage({ id: "external.errors.crm_unavailable" }, { type: "Organisations" }),
                    "error"
                );
            });
            return undefined;
        });
    };

    locationCodes = (): Promise<string[] | undefined> => {
        // @ts-ignore
        return this.fetchJson("surf/crm/location_codes", {}, {}, false).catch(() => {
            setTimeout(() => {
                setFlash(intl.formatMessage({ id: "external.errors.crm_unavailable" }, { type: "Locations" }), "error");
            });
            return undefined;
        });
    };
}
