import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

import {subscriptionInsyncStatus, subscriptionsByProductId} from "../api";
import {isEmpty} from "../utils/Utils";

export default class SubscriptionsSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            subscriptions: [],
            subscriptionRelationsInsyncStatus: {}
        }
    }

    componentDidMount = (productId = this.props.productId) => {
        if (productId) {
            subscriptionsByProductId(productId).then(result =>
                this.setState({subscriptions: result, loading: false})
            );
        } else {
            this.setState({loading: false})
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.productId && nextProps.productId !== this.props.productId) {
            this.componentDidMount(nextProps.productId);
        } else if (isEmpty(nextProps.productId)) {
            this.setState({subscriptions: []})
        }
    };

    onInternalChange() {
        // subscriptionInsyncStatus(value).then(res => {
        //     const subscriptionRelationsInsyncStatus = {...this.state.subscriptionRelationsInsyncStatus};
        //     debugger;
        //     // if (res.json.length > 0) {
        //     //     usedSSPDescriptions[index] = res.json.map(parent => parent.description).join(", ");
        //     // } else {
        //     //     this.clearErrors(index);
        //     // }
        //     // this.setState({subscriptionRelationsInsyncStatus: subscriptionRelationsInsyncStatus});
        // });
    };


    render() {
        const {subscriptions} = this.state;
        const {productId, onChange, disabled, subscription} = this.props;
        const placeholder = productId ? I18n.t("subscription_select.placeholder") : I18n.t("subscription_select.select_product");
        return (
            <div>
                <Select onChange={onChange}
                        options={subscriptions.map(x => ({value: x.subscription_id, label: x.description}))}
                        value={subscription}
                        searchable={true}
                        disabled={disabled || subscriptions.length === 0}
                        placeholder={placeholder}/>
            </div>
        );
    }

}
SubscriptionsSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    productId: PropTypes.string,
    disabled: PropTypes.bool,
    subscription: PropTypes.string
};
