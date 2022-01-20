/*
 * Copyright 2019-2020 SURF.
 */

import { EuiComboBox, EuiSpacer, EuiText } from "@elastic/eui";
import React, { useState } from "react";

// Todo: internationalisation
// import { FormattedMessage } from "react-intl";
import { Filter } from "../types";

type filterCallback = (filters: Filter[]) => void;

interface IProps {
    items: Filter[];
    filterBy: filterCallback;
    selectAll?: (event: React.MouseEvent<HTMLElement>) => void;
    label?: string;
    noTrans?: boolean;
}

export default function LabelledFilter({ items, filterBy, selectAll, label, noTrans }: IProps) {
    const transformFilterToComboOption = (filter: Filter) => ({
        label: filter.name,
        name: filter.name,
    });
    const selectedFilterNames = items.filter((f) => f.selected).map((f) => f.name);
    const optionsStatic = items.map(transformFilterToComboOption);
    // this filters correctly
    const defaultSelection = optionsStatic.filter((f, index) => {
        return selectedFilterNames.includes(f.name);
    });
    // But defaultSelection is not used as default state here.
    // Obviously something I did wrong.
    const [selectedOptions, setSelected] = useState(defaultSelection);
    // so we force that.
    if (defaultSelection.length > 0 && selectedOptions.length === 0) {
        setSelected(defaultSelection);
    }

    const onChange = (selectedOptions: any[]) => {
        setSelected(selectedOptions);
        filterBy(selectedOptions);
    };

    return (
        <React.Fragment>
            {optionsStatic.length && (
                <>
                    <EuiText>
                        <h5>{label}</h5>
                    </EuiText>
                    <EuiSpacer size="s" />
                    <EuiComboBox
                        aria-label="Filter by prefix"
                        placeholder="Select prefixes"
                        options={optionsStatic}
                        selectedOptions={selectedOptions}
                        onChange={onChange}
                        // onCreateOption={onCreateOption}
                        isClearable={true}
                        data-test-subj="demoComboBox"
                    />
                </>
            )}
        </React.Fragment>
    );
}
