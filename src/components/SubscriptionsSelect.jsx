import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

import {subscriptionsByProductId} from "../api";
import {isEmpty} from "../utils/Utils";

export default class SubscriptionsSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            availableSubscriptions: [],
        }
    };

    componentDidMount = (productId = this.props.productId) => {
        if (productId) {
            subscriptionsByProductId(productId).then(result =>
                this.setState({availableSubscriptions: result, loading: false})
            );
        } else {
            this.setState({loading: false})
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.productId && nextProps.productId !== this.props.productId) {
            this.componentDidMount(nextProps.productId);
        } else if (isEmpty(nextProps.productId)) {
            this.setState({availableSubscriptions: []})
        }
    };

    onChangeInternal = index => value => {
        const subscriptions = [...this.props.selectedSubscriptions];
        subscriptions[index] = value;
        this.props.onChange(subscriptions);
    };

    addSubscription = () => {
        const subscriptions = [...this.props.selectedSubscriptions];
        subscriptions.push(null);
        this.props.onChange(subscriptions);
    };

    removeSubscription = index => {
        const subscriptions = [...this.props.selectedSubscriptions];
        subscriptions.splice(index, 1);
        this.props.onChange(subscriptions);
    };

    initSelectedSubscriptions = minimum => {
        var subscriptions = [];
        subscriptions.fill(null, minimum);
        return subscriptions;
    };


    render() {
        const {availableSubscriptions} = this.state;
        const {productId, disabled, selectedSubscriptions, minimum, maximum} = this.props;
        const placeholder = productId ? I18n.t("subscription_select.placeholder") : I18n.t("subscription_select.select_product");
        const subscriptions = isEmpty(selectedSubscriptions) ? this.initSelectedSubscriptions(minimum) : selectedSubscriptions;
        const showAdd = maximum > minimum;
        return (
            <div className="subscription-select">
                {subscriptions.map((subscription, index) => {
                return <div>
                <Select onChange={this.onChangeInternal(index)}
                        key={index}
                        options={availableSubscriptions.map(x => ({value: x.subscription_id, label: x.description}))}
                        value={subscription}
                        searchable={true}
                        disabled={disabled || availableSubscriptions.length === 0}
                        placeholder={placeholder}/>

                {(minimum < index) && <i className={`fa fa-minus ${index < minimum ? "disabled" : "" }`}
                                                  onClick={this.removeSubscription(index)}></i>}
                </div>
              })
            }
            {showAdd && <div className="add-subscription"><i className="fa fa-plus" onClick={this.addSubscription}></i></div>}
            </div>
          )
  };
}

SubscriptionsSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    productId: PropTypes.string,
    disabled: PropTypes.bool,
    selectedSubscriptions: PropTypes.array,
    minimum: PropTypes.number,
    maximum: PropTypes.number
}

SubscriptionsSelect.defaultProps = {
    minimum: 1,
    maximum: 1
}
