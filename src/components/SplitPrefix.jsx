import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

import {subnets} from "../api";

import "react-select/dist/react-select.css";
import "./SplitPrefix.scss";


export default class SplitPrefix extends React.PureComponent {


    constructor(props, context) {
        super(props, context);
        this.state = {
            isValid: true,
            subnets: [],
            desired_prefixlen: 0,
            selected_subnet: ""
		};
    }

    componentDidMount(){
        const {subnet, netmask, prefixlen} = {...this.props};
        subnets(subnet, netmask, prefixlen).then(result =>{
            this.setState({subnets:result['subnets'],
                desired_prefixlen: parseInt(netmask, 10),
                selected_subnet: subnet + "/" + netmask,
                loading: false});
        });

    }

    changePrefixLength = e => {
        const {subnet, netmask} = {...this.props};
        const prefixlen = e ? e.value : null;
        if (prefixlen){
            subnets(subnet, netmask, prefixlen).then(result => {
                this.setState({subnets: result['subnets'], desired_prefixlen: prefixlen, loading: false, isValid: false});
            })
        }
    }

    selectSubnet = e => {
        this.setState({selected_subnet: e.value, isValid: true});
        this.props.onChange(e.value);
    }

    render() {
        const {subnet, netmask, prefixlen} = this.props;
        const version = subnet.indexOf(":") ? 6 : 4;
        const max_for_version = version === 4 ? 32 : 64;
        const {desired_prefixlen, selected_subnet} = this.state;
        const prefixlengths = [...Array(max_for_version-prefixlen+1).keys()].map(x => prefixlen + x );
	return <section><h3>Selected prefix: {subnet}/{netmask}</h3>
            <div>Desired netmask of the new subnet:</div>
            <Select onChange={this.changePrefixLength}
                options={prefixlengths.map(pl => ({value: pl, label: pl}))}
                    value = {desired_prefixlen}
            />
            {this.state.subnets &&
            <div><div>Desired prefix:</div>
                    <Select options={this.state.subnets.map(sn => ({label: sn, value: sn}))}
                            onChange={this.selectSubnet}
                            value={selected_subnet}
                            />
                </div>
            }
        </section> ;
    }

}

SplitPrefix.propTypes = {
    subnet: PropTypes.string,
    netmask: PropTypes.string,
    prefixlen: PropTypes.number,
    onChange: PropTypes.func.isRequired

};
