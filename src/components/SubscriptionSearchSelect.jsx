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

import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";

export default function SubscriptionSearchSelect({
    id,
    subscriptions,
    subscription,
    onChange,
    disabled,
    organisation
}) {
    const options = subscriptions.map(sub => ({
        value: sub.subscription_id,
        label: sub.description
    }));

    const value = options.find(option => option.value === subscription);

    return (
        <div>
            <Select
                id={id}
                onChange={onChange}
                options={options}
                value={value}
                isSearchable={true}
                isDisabled={disabled || subscriptions.length === 0}
                placeholder={
                    organisation
                        ? I18n.t("subscription.namedSelectSubscriptionPlaceholder", {
                              name: organisation
                          })
                        : I18n.t("subscription.selectSubscriptionPlaceholder")
                }
            />
        </div>
    );
}
SubscriptionSearchSelect.propTypes = {
    id: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    subscriptions: PropTypes.array,
    subscription: PropTypes.string,
    organisation: PropTypes.string
};
