/*
 * Copyright 2019 SURF.
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

import PropTypes from "prop-types";
import React from "react";
import Select from "react-select";

import { ieeeInterfaceTypesForProductId } from "../api/index";
import { isEmpty } from "../utils/Utils";

export default class IEEEInterfaceTypesForProductTagSelect extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            interfaceTypes: []
        };
    }

    componentDidMount = (productId = this.props.productId) => {
        if (productId) {
            ieeeInterfaceTypesForProductId(productId).then(result => this.setState({ interfaceTypes: result }));
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.productId && nextProps.productId !== this.props.productId) {
            this.componentDidMount(nextProps.productId);
        } else if (isEmpty(nextProps.productId)) {
            this.setState({ interfaceTypes: [] });
        }
    }

    render() {
        const { interfaceTypes } = this.state;
        const { onChange, interfaceType, disabled } = this.props;

        const options = interfaceTypes.map(aInterfaceType => {
            return { value: aInterfaceType, label: aInterfaceType };
        });
        const value = options.find(option => option.value === interfaceType);
        return (
            <Select
                className="select-interface-type"
                onChange={onChange}
                options={options}
                value={value}
                isSearchable={true}
                isDisabled={disabled || interfaceTypes.length === 0}
                placeholder={
                    interfaceTypes.length > 0 ? "Select an IEEE interface type..." : "First select a product type..."
                }
            />
        );
    }
}

IEEEInterfaceTypesForProductTagSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    interfaceType: PropTypes.string,
    productId: PropTypes.string,
    disabled: PropTypes.bool
};
