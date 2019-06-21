import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";

import "./SubscriptionProductTagSelect.scss";
import { subscriptionsByTags } from "../api";

export default class SubscriptionProductTagSelect extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            subscriptions: [],
            loading: true
        };
    }

    componentDidMount = () => {
        subscriptionsByTags(this.props.tags).then(result => {
            let subscriptions = result.filter(item => this.props.statusList.includes(item.status));
            if (this.props.productId) {
                subscriptions = subscriptions.filter(item => item.product_id === this.props.productId);
            }
            if (this.props.excludedSubscriptionIds.length > 0) {
                subscriptions = subscriptions.filter(
                    item => !this.props.excludedSubscriptionIds.includes(item.subscription_id)
                );
            }
            this.setState({ subscriptions: subscriptions, loading: false });
        });
    };

    render() {
        const { loading } = this.state;
        const { productId, disabled, subscription } = this.props;
        const placeholder = productId
            ? I18n.t("subscription_product_tag_select.placeholder_selected_product")
            : I18n.t("subscription_product_tag_select.placeholder");

        let subscriptions = this.state.subscriptions;

        const options = subscriptions.map(s => ({
            value: s.subscription_id,
            label: `${s.subscription_id.slice(0, 8)} - ${s.description} (${s.status})`
        }));

        const value = options.find(option => option.value === subscription);

        return (
            <section className="subscription-select">
                <div className="select-box">
                    <Select
                        onChange={this.props.onChange}
                        options={options}
                        isLoading={loading}
                        value={value}
                        isSearchable={true}
                        isDisabled={disabled || subscriptions.length === 0}
                        placeholder={placeholder}
                    />
                </div>
            </section>
        );
    }
}

SubscriptionProductTagSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    productId: PropTypes.string, // leave empty if you want all subscriptions of given tag
    disabled: PropTypes.bool,
    tags: PropTypes.array.isRequired,
    statusList: PropTypes.array,
    excludedSubscriptionIds: PropTypes.array
};

SubscriptionProductTagSelect.defaultProps = {
    statusList: ["provisioning", "active"],
    excludedSubscriptionIds: []
};
