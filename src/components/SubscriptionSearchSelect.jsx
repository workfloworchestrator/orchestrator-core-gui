import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";

export default function SubscriptionSearchSelect({ subscriptions, subscription, onChange, disabled, organisation }) {
    const options = subscriptions.map(sub => ({
        value: sub.subscription_id,
        label: sub.description
    }));

    const value = options.find(option => option.value === subscription);

    return (
        <div>
            <Select
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
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    subscriptions: PropTypes.array,
    subscription: PropTypes.string,
    organisation: PropTypes.string
};
