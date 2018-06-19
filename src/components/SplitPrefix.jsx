import React from "react";
import PopUp from "reactjs-popup";
import PropTypes from "prop-types";

import {subnets, subscriptions} from "../api";

import "react-select/dist/react-select.css";
import "./SplitPrefix.css";
import I18n from "i18n-js";
import {renderDateTime} from "../utils/Lookups";
import {stop} from "../utils/Utils";
import {actionOptions} from "../validations/Prefixes";
import DropDownActions from "../components/DropDownActions";


export default class SplitPrefix extends React.PureComponent {


    constructor(props, context) {
        super(props, context);
        this.state = {
            isValid: true,
            subnet: "",
            netmask: "",
            prefixlen: 32
		};
    }

    componentDidMount(){
        const {subnet, netmask, prefixlen} = {...this.props};
        subnets(subnet, netmask, prefixlen).then(result =>{
            this.setState({subnets:result['subnets'], loading: false});
        });

    }


    dropDownChange(){
        subnets().then(result =>{
            this.setState({subnets:result['subnets'], loading: false});
        });
    }

    render() {
        const {subnet, netmask, prefixlen} = this.props;
        return <section>{subnet} {netmask} {prefixlen}
            {this.state.subnets && <div>{this.state.subnets}</div>}
        </section> ;
    }

}

SplitPrefix.propTypes = {
    subnet: PropTypes.string.isRequired,
    netmask: PropTypes.string.isRequired,
    prefixlen: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};
