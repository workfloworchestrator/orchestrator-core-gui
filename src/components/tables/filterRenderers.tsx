/*
 * Copyright 2019-2020 SURF.
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

import DropDownContainer from "components/DropDownContainer";
import OrganisationSelect from "components/OrganisationSelect";
import I18n from "i18n-js";
import debounce from "lodash/debounce";
import React, { Dispatch } from "react";
import Select from "react-select";
import { ColumnInstance, TableState } from "react-table";
import { ProcessV2 } from "utils/types";

import { ActionType, TableSettingsAction } from "./NwaTable";

/*
 * Functional components to use as filter input fields in tables.
 * Note that none of the renderers are valid standalone react components as they expect the complete table state and dispatch.
 */

const renderFilterIcon = (filtering: boolean) => (active: boolean) => {
    return (
        <>
            {filtering ? (
                <i className={`fa fa-check-square${active ? " active" : ""}`} />
            ) : (
                <i className={`fa fa-square-o${active ? " active" : ""}`} />
            )}
            <i className={active ? "fa fa-caret-down active" : "fa fa-caret-right"} />
        </>
    );
};

export function renderCustomersFilter({
    state,
    dispatch,
    column
}: {
    state: TableState<ProcessV2>;
    dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
    column: ColumnInstance;
}) {
    /*
     * Note: The organisation UUID contains hyphens and hyphens are used as separators for the filter values
     * in the URL. To track the organisation filter value we either needed to keep an extra state value, pick another
     * separator string (with new edge cases) or embrace the separator and see the organisation as an array of
     * UUID parts. The last option is used here.
     */
    const current = state.filterBy.find(filter => filter.id === "organisation");
    const selectedOrganisation = current ? current.values.join("-") : null;
    const filtering = selectedOrganisation !== null;
    return (
        <DropDownContainer
            title={column.id}
            renderButtonContent={renderFilterIcon(filtering)}
            renderContent={(disabled: boolean) => (
                <OrganisationSelect
                    id={`filter-${state.name}.${column.id}`} // will set and inputId itself, based on the id
                    organisation={selectedOrganisation}
                    onChange={(selected, action) => {
                        // See https://github.com/JedWatson/react-select/issues/2902 why we need this.
                        if (Array.isArray(selected)) {
                            throw new Error("Expected a single value from react-select");
                        }
                        if (action.action === "select-option" && selected) {
                            dispatch({
                                type: ActionType.FILTER_REPLACE,
                                id: "organisation",
                                values: selected.value.split("-")
                            });
                        } else if (action.action === "clear") {
                            dispatch({ type: ActionType.FILTER_CLEAR, id: "organisation" });
                        }
                    }}
                    placeholder={I18n.t(`table.filter_placeholder.${column.id}`)}
                    abbreviate={column.id === "abbrev"}
                    disabled={disabled}
                />
            )}
        />
    );
}

export function renderMultiSelectFilter(
    allOptions: string[],
    i18nPrefix: string | null,
    {
        state,
        dispatch,
        column
    }: {
        state: TableState<ProcessV2>;
        dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
        column: ColumnInstance;
    }
) {
    const current = state.filterBy.find(filter => filter.id === column.id);
    const currentFilter = current ? current.values : null;
    const options = i18nPrefix
        ? allOptions.map(val => ({ value: val, label: I18n.t(`${i18nPrefix}.${val}`) }))
        : allOptions.map(val => ({ value: val, label: val }));
    const selected = currentFilter ? options.filter(({ value }) => currentFilter.includes(value)) : [];
    const filtering = selected.length > 0;
    const onChange = (selected: any, action: any) => {
        if (action && action.action === "select-option") {
            dispatch({ type: ActionType.FILTER_ADD, id: column.id, value: action.option.value });
        } else if (action.action === "remove-value") {
            dispatch({ type: ActionType.FILTER_REMOVE, id: column.id, value: action.removedValue.value });
        } else if (action.action === "clear") {
            dispatch({ type: ActionType.FILTER_CLEAR, id: column.id });
        }
    };
    return (
        <DropDownContainer
            title={column.id}
            renderButtonContent={renderFilterIcon(filtering)}
            renderContent={disabled => (
                <Select
                    id={`filter-${state.name}.${column.id}`}
                    inputId={`input-filter-${state.name}.${column.id}`}
                    isDisabled={disabled}
                    isMulti
                    value={selected}
                    name={"multi-select"}
                    options={options}
                    onChange={onChange}
                    placeholder={I18n.t(`table.filter_placeholder.${column.id}`)}
                />
            )}
        />
    );
}

export function renderSingleSelectFilter(
    allOptions: string[],
    i18nPrefix: string | null,
    {
        state,
        dispatch,
        column
    }: {
        state: TableState<ProcessV2>;
        dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
        column: ColumnInstance;
    }
) {
    const current = state.filterBy.find(filter => filter.id === column.id);
    const currentFilter = current ? current.values : null;
    const options = i18nPrefix
        ? allOptions.map(val => ({ value: val, label: I18n.t(`${i18nPrefix}.${val}`) }))
        : allOptions.map(val => ({ value: val, label: val }));
    const selected = currentFilter ? options.filter(({ value }) => currentFilter.includes(value)) : [];
    const filtering = selected.length > 0;
    const onChange = (selected: any, action: any) => {
        if (action && action.action === "select-option") {
            if (filtering) {
                dispatch({ type: ActionType.FILTER_CLEAR, id: column.id });
            }
            dispatch({ type: ActionType.FILTER_ADD, id: column.id, value: action.option.value });
        } else if (action.action === "remove-value") {
            dispatch({ type: ActionType.FILTER_REMOVE, id: column.id, value: action.removedValue.value });
        } else if (action.action === "clear") {
            dispatch({ type: ActionType.FILTER_CLEAR, id: column.id });
        }
    };
    return (
        <DropDownContainer
            title={column.id}
            renderButtonContent={renderFilterIcon(filtering)}
            renderContent={disabled => (
                <Select
                    id={`filter-${state.name}.${column.id}`}
                    inputId={`input-filter-${state.name}.${column.id}`}
                    isDisabled={disabled}
                    isMulti
                    value={selected}
                    name={"multi-select"}
                    options={options}
                    onChange={onChange}
                    placeholder={I18n.t(`table.filter_placeholder.${column.id}`)}
                />
            )}
        />
    );
}

const debouncedFilterReplace = debounce((dispatch, id, values) => {
    dispatch({ type: ActionType.FILTER_REPLACE, id, values });
}, 300);

export function renderILikeFilter({
    state,
    dispatch,
    column
}: {
    state: TableState<ProcessV2>;
    dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
    column: ColumnInstance;
}) {
    const current = state.filterBy.find(filter => filter.id === column.id);
    const currentFilter = current ? current.values[0] : null;
    if (column.filterValue && column.filterValue !== currentFilter) {
        debouncedFilterReplace(dispatch, column.id, [column.filterValue]);
    } else if (!column.filterValue && currentFilter) {
        dispatch({ type: ActionType.FILTER_CLEAR, id: column.id });
    }
    return (
        <input
            id={`input-filter-${state.name}.${column.id}`}
            value={column.filterValue}
            onChange={e => {
                column.setFilter(e.target.value || undefined);
            }}
            placeholder={I18n.t(`table.filter_placeholder.${column.id}`)}
        />
    );
}
