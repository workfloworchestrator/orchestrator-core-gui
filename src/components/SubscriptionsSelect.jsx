import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";

import { subscriptionsByProductId, allSubscriptions } from "../api";
import { isEmpty } from "../utils/Utils";
import "./SubscriptionsSelect.scss";

export default class SubscriptionsSelect extends React.PureComponent {
    constructor(props) {
        super(props);
        const { subscriptions, minimum } = this.props;
        const nboxes = subscriptions.length > minimum ? subscriptions.length : minimum;
        this.state = {
            availableSubscriptions: [],
            numberOfBoxes: nboxes
        };
    }

    componentDidMount = () => {
        const { productId } = this.props;
        if (productId) {
            subscriptionsByProductId(productId).then(result =>
                this.setState({ availableSubscriptions: result, loading: false })
            );
        } else {
            allSubscriptions().then(result => this.setState({ availableSubscriptions: result, loading: false }));
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.productId && nextProps.productId !== this.props.productId) {
            this.componentDidMount(nextProps.productId);
        } else if (isEmpty(nextProps.productId)) {
            this.setState({ availableSubscriptions: [] });
        }
    }

    onChangeInternal = index => selection => {
        const { subscriptions } = this.props;
        if (selection && selection.value) {
            subscriptions[index] = selection.value;
        } else {
            subscriptions[index] = null;
        }
        this.props.onChange(subscriptions);
    };

    addSubscription() {
        const nboxes = this.state.numberOfBoxes + 1;
        this.setState({ numberOfBoxes: nboxes });
    }

    removeSubscription(index) {
        const { subscriptions } = this.props;
        const nboxes = this.state.numberOfBoxes - 1;
        if (subscriptions.length > nboxes) {
            subscriptions.splice(index, 1);
            this.props.onChange(subscriptions);
        }
        this.setState({ numberOfBoxes: nboxes });
    }

    render() {
        const { availableSubscriptions, numberOfBoxes } = this.state;
        const { productId, disabled, subscriptions, minimum, maximum } = this.props;
        const placeholder = productId
            ? I18n.t("subscription_select.placeholder")
            : I18n.t("subscription_select.select_product");
        const showAdd = maximum > minimum && subscriptions.length < maximum;
        const boxes =
            subscriptions.length < numberOfBoxes
                ? subscriptions.concat(Array(numberOfBoxes - subscriptions.length).fill(null))
                : subscriptions;

        return (
            <section className="multiple-subscriptions">
                <section className="subscription-select">
                    {boxes.map((subscription, index) => {
                        const options = availableSubscriptions
                            .filter(
                                x => x.subscription_id === subscription || !subscriptions.includes(x.subscription_id)
                            )
                            .map(x => ({
                                value: x.subscription_id,
                                label: x.description
                            }));

                        const value = options.find(option => option.value === subscription);

                        return (
                            <div className="wrapper" key={index}>
                                <div className="select-box" key={index}>
                                    <Select
                                        onChange={this.onChangeInternal(index)}
                                        key={index}
                                        options={options}
                                        value={value}
                                        isSearchable={true}
                                        isDisabled={disabled || availableSubscriptions.length === 0}
                                        placeholder={placeholder}
                                    />
                                </div>

                                {maximum > minimum && (
                                    <i
                                        className={`fa fa-minus ${index < minimum ? "disabled" : ""}`}
                                        onClick={this.removeSubscription.bind(this, index)}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {showAdd && (
                        <div className="add-subscription">
                            <i className="fa fa-plus" onClick={this.addSubscription.bind(this)} />
                        </div>
                    )}
                </section>
            </section>
        );
    }
}

SubscriptionsSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    productId: PropTypes.string,
    disabled: PropTypes.bool,
    subscriptions: PropTypes.array,
    minimum: PropTypes.number,
    maximum: PropTypes.number
};

SubscriptionsSelect.defaultProps = {
    minimum: 1,
    maximum: 1
};
