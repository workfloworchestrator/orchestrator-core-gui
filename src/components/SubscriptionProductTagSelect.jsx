import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

import {subscriptionsByProductId, subscriptionsWithDetails} from "../api";
import {isEmpty} from "../utils/Utils";
import "./SubscriptionsSelect.scss";

export default class SubscriptionsSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            subscriptions: [],
            loading: true
        }
    };

    componentDidMount = () => {
        subscriptionsByTags(this.props.tags).then(result => {
            this.setState({subscriptions: result, loading: false})
        });
    };

    render() {
        const {subscriptions, loading} = this.state;
        const {productId, disabled, tags, statusList, subscription} = this.props;
        const placeholder = productId ? I18n.t("subscription_product_tag_select.placeholder") : I18n.t("subscription_product_tag_select.placeholder_selected_product");

        // Todo; filter subscriptions based on product and status select

        return (
            <section className="subscription-select">
                  <div className="select-box" key={index}>
                  <Select onChange={this.onChangeInternal(index)}
                          key={index}
                          options={
                            subscriptions
                            .filter(x => (
                              x.subscription_id === subscription || !subscriptions.includes(x.subscription_id))
                            )
                            .map(x => ({value: x.subscription_id, label: x.description}))}
                          value={subscription}
                          searchable={true}
                          disabled={disabled || availableSubscriptions.length === 0}
                          placeholder={placeholder}/>
                  </div>

                          {(maximum > minimum) && <i className={`fa fa-minus ${index < minimum  ? "disabled" : "" }`}
                                                  onClick={this.removeSubscription.bind(this, index)}></i>}
               </div>
              )}

            </section>
          )
  };
}

SubscriptionProductTagSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    productId: PropTypes.string, // leave empty if you want all subscriptions of given tag
    disabled: PropTypes.bool,
    tags: PropTypes.array.isRequired,
    statusList: PropTypes.array
};

SubscriptionProductTagSelect.defaultProps = {
    statusList: ["provisioning", "active"]
};
