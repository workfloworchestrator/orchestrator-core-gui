/*
 * Copyright 2019-2022 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { EuiPanel } from "@elastic/eui";
import SubscriptionDetail from "components/subscriptionDetail/SubscriptionDetail";
import {
    renderInsyncCell,
    renderSubscriptionCustomersCell,
    renderSubscriptionDescriptionCell,
    renderSubscriptionIdCell,
    renderSubscriptionProductsCell,
    renderSubscriptionTagCell,
    renderTimestampCell,
} from "components/tables/cellRenderers";
import {
    renderCustomersFilter,
    renderILikeFilter,
    renderMultiSelectFilter,
    renderSingleSelectFilter,
} from "components/tables/filterRenderers";
import { NwaTable, isLocalTableSettings } from "components/tables/NwaTable";
import { subscriptionsStyling } from "components/tables/SubscriptionsStyling";
import chunk from "lodash/chunk";
import isNull from "lodash/isNull";
import last from "lodash/last";
import omitBy from "lodash/omitBy";
import sortedUniq from "lodash/sortedUniq";
import React, { useCallback, useContext, useMemo } from "react";
import {
    Cell,
    Column,
    FilterAndSort,
    LocalTableSettings,
    Row,
    RowPropGetter,
    SessionTableSettings,
    TableSettings,
    TableState,
} from "react-table";
import { useQueryParam } from "use-query-params";
import ApplicationContext from "utils/ApplicationContext";
import { CommaSeparatedNumericArrayParam, CommaSeparatedStringArrayParam } from "utils/QueryParameters";
import { Subscription } from "utils/types";

export function initialSubscriptionsFilterAndSort(showTasks: boolean, statuses: string[]) {
    const initialFilterBy = [{ id: "status", values: statuses }];
    const initialSortBy = [{ id: "start_date", desc: true }];
    return { filterBy: initialFilterBy, sortBy: initialSortBy };
}

export function initialSubscriptionTableSettings(
    name: string,
    filterAndSort: FilterAndSort,
    hiddenColumns: string[],
    optional?: Partial<TableSettings<Subscription>>
): TableSettings<Subscription> {
    const defaults = {
        showAdvancedSearch: false,
        showSettings: false,
        showPaginator: true,
        refresh: false,
        delay: 3000,
        pageSize: 25,
        pageIndex: 0,
        minimized: false,
    };
    let rest = optional ? Object.assign(defaults, optional) : defaults;
    return {
        ...filterAndSort,
        name: name,
        hiddenColumns: hiddenColumns,
        ...rest,
    };
}

interface SubscriptionsTableProps {
    initialTableSettings: TableSettings<Subscription>;
    renderActions: (subscription: Subscription) => JSX.Element;
    isSubscription: boolean;
}

export function SubscriptionsTable({ initialTableSettings, renderActions }: SubscriptionsTableProps) {
    const { name } = initialTableSettings;
    const queryNameSpace = last(name.split("."));
    const [pageQ, setPageQ] = useQueryParam(queryNameSpace + "Page", CommaSeparatedNumericArrayParam);
    const [sortQ, setSortQ] = useQueryParam(queryNameSpace + "Sort", CommaSeparatedStringArrayParam);
    const [filterQ, setFilterQ] = useQueryParam(queryNameSpace + "Filter", CommaSeparatedStringArrayParam);
    const { organisations, products } = useContext(ApplicationContext);

    const initialize = useMemo(
        () =>
            function (current: TableSettings<Subscription>): TableState<Subscription> {
                // First get LocalState from LocalStorage
                const settingsFromLocalStorage: LocalTableSettings<Subscription> | {} = JSON.parse(
                    localStorage.getItem(`table-settings:${current.name}`) || "{}"
                );
                // Then get settings from SessionStorage
                const settingsFromSessionStorage: SessionTableSettings | {} = JSON.parse(
                    sessionStorage.getItem(`table-settings:${current.name}`) || "{}"
                );
                // Then get settings from URL
                let pageIndex: number | null = null;
                let pageSize: number | null = null;
                let sortBy: { id: string; desc: boolean }[] | null = null;
                let filterBy: { id: string; values: string[] }[] | null = null;
                try {
                    if (pageQ) {
                        pageIndex = pageQ[0];
                        pageSize = pageQ[1];
                    }
                    if (sortQ) {
                        sortBy = chunk(sortQ, 2).map(([id, desc]) => ({ id, desc: desc === "desc" }));
                    }
                    if (filterQ) {
                        filterBy = chunk(filterQ, 2).map(([id, values]) => ({
                            id: id,
                            values: values ? values.split("-") : [],
                        }));
                    }
                } catch (err) {
                    console.log(err);
                }
                const settingsFromURL = omitBy(
                    { pageIndex: pageIndex, pageSize: pageSize, sortBy: sortBy, filterBy: filterBy },
                    isNull
                );
                // merge everything and return as new table state. Each object from left to right can override keys from the previous object.
                return Object.assign(
                    { loading: true, pageCount: 0, data: [] },
                    current,
                    settingsFromLocalStorage,
                    settingsFromSessionStorage,
                    settingsFromURL
                );
            },
        [filterQ, pageQ, sortQ]
    );

    const extraRowPropGetter: RowPropGetter<Subscription> = useCallback((props, { row }) => {
        return {
            ...props,
            id: row.values.subscription_id,
            className: `${row.values.status}`,
        };
    }, []);

    const renderSubComponent = useCallback(({ row }: { row: Row<Subscription> }) => {
        const { subscription_id } = row.values;
        return (
            <div className={"expanded-row"}>
                <SubscriptionDetail subscriptionId={subscription_id} />
            </div>
        );
    }, []);

    const initialState = useMemo(() => initialize(initialTableSettings), [initialTableSettings, initialize]);
    const columns: Column<Subscription>[] = useMemo(
        () =>
            [
                {
                    Header: "",
                    id: "info",
                    accessor: "info",
                    disableFilters: true,
                    disableSortBy: true,
                    Cell: ({ row, cell }: { row: Row; cell: Cell }) => {
                        const button = row.isExpanded ? (
                            <i className={`fa fa-minus-circle ${row.values.status}`} />
                        ) : (
                            <i className={`fa fa-plus-circle ${row.values.status}`} />
                        );
                        return (
                            <div
                                {...row.getToggleRowExpandedProps()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    row.toggleRowExpanded();
                                }}
                            >
                                {button}
                            </div>
                        );
                    },
                },
                {
                    Header: "id",
                    accessor: "subscription_id",
                    Filter: renderILikeFilter,
                    disableFilters: false,
                    Cell: renderSubscriptionIdCell,
                },
                {
                    Header: "Description",
                    accessor: "description",
                    Filter: renderILikeFilter,
                    Cell: renderSubscriptionDescriptionCell,
                },
                {
                    Header: "Status",
                    accessor: "status",
                    Filter: renderMultiSelectFilter.bind(
                        null,
                        ["active", "terminated", "initial", "provisioning", "migrating"],
                        null
                    ),
                },
                {
                    Header: "In Sync",
                    id: "insync",
                    accessor: "insync",
                    Cell: renderInsyncCell,
                    Filter: renderSingleSelectFilter.bind(null, ["yes", "no"], null),
                },
                {
                    Header: "Customer",
                    id: "customer", // Normally the accessor is used as id, but when used twice this gives a name clash.
                    accessor: "customer_id",
                    disableSortBy: true,
                    Cell: renderSubscriptionCustomersCell(organisations, false),
                    Filter: renderCustomersFilter,
                },
                {
                    Header: "Abbr.",
                    id: "abbrev",
                    accessor: "customer_id",
                    disableSortBy: true,
                    Cell: renderSubscriptionCustomersCell(organisations, true),
                    Filter: renderCustomersFilter,
                },
                {
                    Header: "Product",
                    id: "product",
                    accessor: "product",
                    Cell: renderSubscriptionProductsCell,
                    Filter: renderMultiSelectFilter.bind(null, sortedUniq(products.map((p) => p.name).sort()), null),
                },
                {
                    Header: "Tag",
                    id: "tag",
                    accessor: "product",
                    Cell: renderSubscriptionTagCell,
                    Filter: renderMultiSelectFilter.bind(null, sortedUniq(products.map((p) => p.tag).sort()), null),
                },
                {
                    Header: "Start date",
                    id: "start_date",
                    accessor: "start_date",
                    Cell: renderTimestampCell,
                    disableFilters: true,
                },
                {
                    Header: "End date",
                    id: "end_date",
                    accessor: "end_date",
                    Cell: renderTimestampCell,
                    disableFilters: true,
                },
                {
                    Header: "Notes",
                    id: "note",
                    accessor: "note",
                    // @ts-ignore Filter isn't recognized as valid property
                    Filter: renderILikeFilter,
                },
            ] as Column<Subscription>[],
        [organisations, products]
    );

    const persistSettings = useCallback(
        (settings: LocalTableSettings<Subscription> | SessionTableSettings) => {
            if (isLocalTableSettings(settings)) {
                localStorage.setItem(`table-settings:${name}`, JSON.stringify(settings));
            } else {
                sessionStorage.setItem(`table-settings:${name}`, JSON.stringify(settings));
                setPageQ([settings.pageIndex, settings.pageSize]);
                setSortQ(settings.sortBy.map(({ id, desc }) => [id, desc ? "desc" : "asc"]).flat());
                setFilterQ(settings.filterBy.map(({ id, values }) => [id, values.join("-")]).flat());
            }
        },
        [name, setFilterQ, setPageQ, setSortQ]
    );

    return (
        <div key={name}>
            <EuiPanel css={subscriptionsStyling} className="nwa-table" id={`${name}-subscriptions`}>
                <NwaTable<Subscription>
                    columns={columns}
                    initialState={initialState as TableState<Subscription>}
                    persistSettings={persistSettings}
                    endpoint={"subscriptions/"}
                    initialTableSettings={initialTableSettings}
                    extraRowPropGetter={extraRowPropGetter}
                    renderSubComponent={renderSubComponent}
                    excludeInFilter={["description"]}
                    advancedSearch={true}
                />
            </EuiPanel>
        </div>
    );
}
