/*
 * Copyright 2019-2023 SURF.
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
import {
    FilterArgument,
    IdType,
    SortingRule,
    UseColumnOrderInstanceProps,
    UseColumnOrderState,
    UseExpandedHooks,
    UseExpandedInstanceProps,
    UseExpandedOptions,
    UseExpandedRowProps,
    UseExpandedState,
    UseFiltersColumnOptions,
    UseFiltersColumnProps,
    UseFiltersInstanceProps,
    UseFiltersOptions,
    UseFiltersState,
    UseGlobalFiltersInstanceProps,
    UseGlobalFiltersOptions,
    UseGlobalFiltersState,
    UseGroupByCellProps,
    UseGroupByColumnOptions,
    UseGroupByColumnProps,
    UseGroupByHooks,
    UseGroupByInstanceProps,
    UseGroupByOptions,
    UseGroupByRowProps,
    UseGroupByState,
    UsePaginationInstanceProps,
    UsePaginationOptions,
    UsePaginationState,
    UseResizeColumnsColumnOptions,
    UseResizeColumnsColumnProps,
    UseResizeColumnsOptions,
    UseResizeColumnsState,
    UseRowSelectHooks,
    UseRowSelectInstanceProps,
    UseRowSelectOptions,
    UseRowSelectRowProps,
    UseRowSelectState,
    UseRowStateCellProps,
    UseRowStateInstanceProps,
    UseRowStateOptions,
    UseRowStateRowProps,
    UseRowStateState,
    UseSortByColumnOptions,
    UseSortByColumnProps,
    UseSortByHooks,
    UseSortByInstanceProps,
    UseSortByOptions,
    UseSortByState,
} from "react-table";

declare module "react-table" {
    // take this file as-is, or comment out the sections that don't apply to your plugin configuration

    export interface TableOptions<D extends object>
        extends UseExpandedOptions<D>,
            UseFiltersOptions<D>,
            UseFiltersOptions<D>,
            UseGlobalFiltersOptions<D>,
            UseGroupByOptions<D>,
            UsePaginationOptions<D>,
            UseResizeColumnsOptions<D>,
            UseRowSelectOptions<D>,
            UseRowStateOptions<D>,
            UseSortByOptions<D>,
            // note that having Record here allows you to add anything to the options, this matches the spirit of the
            // underlying js library, but might be cleaner if it's replaced by a more specific type that matches your
            // feature set, this is a safe default.
            Record<string, any> {}

    export interface Hooks<D extends object = {}>
        extends UseExpandedHooks<D>,
            UseGroupByHooks<D>,
            UseRowSelectHooks<D>,
            UseSortByHooks<D> {}

    export interface TableInstance<D extends object = {}>
        extends UseColumnOrderInstanceProps<D>,
            UseExpandedInstanceProps<D>,
            UseFiltersInstanceProps<D>,
            UseGlobalFiltersInstanceProps<D>,
            UseGroupByInstanceProps<D>,
            UsePaginationInstanceProps<D>,
            UseRowSelectInstanceProps<D>,
            UseRowStateInstanceProps<D>,
            UseSortByInstanceProps<D> {}

    /* [PF] The following interfaces are added specifically for our implementation */
    export interface FilterAndSort {
        filterBy: FilterArgument[];
        sortBy: SortingRule<string>[];
    }

    export interface LocalTableSettings<D> extends FilterAndSort {
        showSettings: boolean;
        showPaginator: boolean;
        hiddenColumns?: IdType<D>[];
        delay: number;
    }

    export interface SessionTableSettings extends FilterAndSort {
        refresh: boolean;
        pageSize: number;
        pageIndex: number;
        minimized: boolean;
    }

    export interface ApiTableState<D> {
        loading: boolean;
        pageCount: number;
        data: D[];
    }

    export interface TableSettings<D> extends LocalTableSettings<D>, SessionTableSettings {
        name: string;
    }
    /* end of our specific interfaces */

    export interface TableState<D extends object = {}>
        extends UseColumnOrderState<D>,
            UseExpandedState<D>,
            UseFiltersState<D>,
            UseGlobalFiltersState<D>,
            UseGroupByState<D>,
            UsePaginationState<D>,
            UseResizeColumnsState<D>,
            UseRowSelectState<D>,
            UseRowStateState<D>,
            UseSortByState<D>,
            TableSettings<D>,
            ApiTableState<D> {}

    export interface Column<D extends object = {}>
        extends UseFiltersColumnOptions<D>,
            UseFiltersColumnOptions<D>,
            UseGroupByColumnOptions<D>,
            UseResizeColumnsColumnOptions<D>,
            UseSortByColumnOptions<D> {}

    export interface ColumnInstance<D extends object = {}>
        extends UseFiltersColumnProps<D>,
            UseGroupByColumnProps<D>,
            UseResizeColumnsColumnProps<D>,
            UseSortByColumnProps<D> {}

    export interface Cell<D extends object = {}> extends UseGroupByCellProps<D>, UseRowStateCellProps<D> {}

    export interface Row<D extends object = {}>
        extends UseExpandedRowProps<D>,
            UseGroupByRowProps<D>,
            UseRowSelectRowProps<D>,
            UseRowStateRowProps<D> {
        allCells: Cell[];
        toggleRowExpanded: any;
        getToggleRowExpandedProps: any;
    }

    // [PF] only key is in TableKeyedProps in @types/react-table
    export interface TableCellProps extends TableKeyedProps {
        className: string;
    }

    export interface TableRowProps extends TableKeyedProps {
        className: string;
    }
}
