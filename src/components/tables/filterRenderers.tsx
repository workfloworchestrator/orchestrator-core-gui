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

import { EuiFieldText } from "@elastic/eui";
import DropDownContainer from "components/tables/DropDownContainer";
import { ActionType, TableSettingsAction } from "components/tables/NwaTable";
import { intl } from "locale/i18n";
import debounce from "lodash/debounce";
import React, { Dispatch, useContext } from "react";
import Select, { ActionMeta, ValueType } from "react-select";
import { ColumnInstance, TableState } from "react-table";
import ApplicationContext from "utils/ApplicationContext";
import { Option, Organization, ProcessV2 } from "utils/types";

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

function CustomersFilter({
    state,
    dispatch,
    column,
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
    const current = state.filterBy.find((filter) => filter.id === "organisation");
    const selectedOrganisation = current ? current.values.join("-") : null;
    const filtering = selectedOrganisation !== null;

    const { organisations } = useContext(ApplicationContext);

    const options: Option[] = organisations
        ? organisations
              .map((org: Organization) => ({
                  value: org.uuid,
                  label: column.id === "abbrev" ? org.abbr : org.name,
              }))
              .sort((a, b) => a.label.localeCompare(b.label))
        : [];
    const value = options.find((option: Option) => option.value === selectedOrganisation);

    return (
        <DropDownContainer
            title={column.id}
            renderButtonContent={renderFilterIcon(filtering)}
            renderContent={(disabled: boolean, reset) => (
                <Select<Option, false>
                    ref={(ref) => ref?.focus()}
                    id={`filter-${state.name}.${column.id}`}
                    inputID={`input-filter-${state.name}.${column.id}`}
                    onChange={(selected, action) => {
                        // See https://github.com/JedWatson/react-select/issues/2902 why we need this.
                        if (Array.isArray(selected)) {
                            throw new Error("Expected a single value from react-select");
                        }
                        if (action.action === "select-option" && selected) {
                            dispatch({
                                type: ActionType.FILTER_REPLACE,
                                id: "organisation",
                                values: (selected as Option).value.split("-"),
                            });
                        } else if (action.action === "clear") {
                            dispatch({ type: ActionType.FILTER_CLEAR, id: "organisation" });
                        }
                    }}
                    options={options}
                    value={value}
                    isSearchable={true}
                    isClearable={true}
                    placeholder={intl.formatMessage({ id: `table.filter_placeholder.${column.id}` })}
                    isDisabled={disabled || organisations?.length === 0}
                    onBlur={reset}
                />
            )}
        />
    );
}

export function renderCustomersFilter(props: {
    state: TableState<ProcessV2>;
    dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
    column: ColumnInstance;
}) {
    return <CustomersFilter {...props} />;
}

export function renderMultiSelectFilter(
    allOptions: string[],
    i18nPrefix: string | null,
    {
        state,
        dispatch,
        column,
    }: {
        state: TableState<ProcessV2>;
        dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
        column: ColumnInstance;
    }
) {
    const current = state.filterBy.find((filter) => filter.id === column.id);
    const currentFilter = current ? current.values : null;
    const options = i18nPrefix
        ? allOptions.map((val) => ({
              value: val,
              label: intl.formatMessage({ id: `${i18nPrefix}.${val}` }),
          }))
        : allOptions.map((val) => ({ value: val, label: val }));
    const selected = currentFilter ? options.filter(({ value }) => currentFilter.includes(value)) : [];
    const filtering = selected.length > 0;
    const onChange = (selected: ValueType<Option, true>, action: ActionMeta<Option>) => {
        if (action && action.action === "select-option") {
            dispatch({ type: ActionType.FILTER_ADD, id: column.id, value: action.option!.value });
        } else if (action.action === "remove-value") {
            dispatch({ type: ActionType.FILTER_REMOVE, id: column.id, value: action.removedValue!.value });
        } else if (action.action === "clear") {
            dispatch({ type: ActionType.FILTER_CLEAR, id: column.id });
        }
    };
    return (
        <DropDownContainer
            title={column.id}
            renderButtonContent={renderFilterIcon(filtering)}
            renderContent={(disabled, reset) => (
                <Select<Option, true>
                    ref={(ref) => ref?.focus()}
                    id={`filter-${state.name}.${column.id}`}
                    inputId={`input-filter-${state.name}.${column.id}`}
                    isDisabled={disabled}
                    isMulti
                    value={selected}
                    name={"multi-select"}
                    options={options}
                    onChange={onChange}
                    placeholder={intl.formatMessage({ id: `table.filter_placeholder.${column.id}` })}
                    onBlur={reset}
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
        column,
    }: {
        state: TableState<ProcessV2>;
        dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
        column: ColumnInstance;
    }
) {
    const current = state.filterBy.find((filter) => filter.id === column.id);
    const currentFilter = current ? current.values : null;
    const options = i18nPrefix
        ? allOptions.map((val) => ({
              value: val,
              label: intl.formatMessage({ id: `${i18nPrefix}.${val}` }),
          }))
        : allOptions.map((val) => ({ value: val, label: val }));
    const selected = currentFilter ? options.filter(({ value }) => currentFilter.includes(value)) : [];
    const filtering = selected.length > 0;
    const onChange = (selected: ValueType<Option, true>, action: ActionMeta<Option>) => {
        if (action && action.action === "select-option") {
            if (filtering) {
                dispatch({ type: ActionType.FILTER_CLEAR, id: column.id });
            }
            dispatch({ type: ActionType.FILTER_ADD, id: column.id, value: action.option!.value });
        } else if (action.action === "remove-value") {
            dispatch({ type: ActionType.FILTER_REMOVE, id: column.id, value: action.removedValue!.value });
        } else if (action.action === "clear") {
            dispatch({ type: ActionType.FILTER_CLEAR, id: column.id });
        }
    };
    return (
        <DropDownContainer
            title={column.id}
            renderButtonContent={renderFilterIcon(filtering)}
            renderContent={(disabled, reset) => (
                <Select<Option, true>
                    ref={(ref) => ref?.focus()}
                    id={`filter-${state.name}.${column.id}`}
                    inputId={`input-filter-${state.name}.${column.id}`}
                    isDisabled={disabled}
                    isMulti
                    value={selected}
                    name={"multi-select"}
                    options={options}
                    onChange={onChange}
                    placeholder={intl.formatMessage({ id: `table.filter_placeholder.${column.id}` })}
                    onBlur={reset}
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
    column,
}: {
    state: TableState<ProcessV2>;
    dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
    column: ColumnInstance;
}) {
    const current = state.filterBy.find((filter) => filter.id === column.id);
    const currentFilter = current ? current.values[0] : null;
    if (column.filterValue && column.filterValue !== currentFilter) {
        debouncedFilterReplace(dispatch, column.id, [column.filterValue]);
    } else if (!column.filterValue && currentFilter) {
        dispatch({ type: ActionType.FILTER_CLEAR, id: column.id });
    }
    return (
        <EuiFieldText
            compressed={true}
            id={`input-filter-${state.name}.${column.id}`}
            value={column.filterValue}
            onChange={(e) => {
                column.setFilter(e.target.value || undefined);
            }}
            placeholder={intl.formatMessage({ id: `table.filter_placeholder.${column.id}` })}
        />
    );
}
