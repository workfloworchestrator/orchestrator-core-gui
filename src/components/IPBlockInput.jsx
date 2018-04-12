import React from "react";
import PropTypes from "prop-types";

import "react-select/dist/react-select.css";
import "./IPBlocks.css";
import {validIPv4RangeRegExp,validIPv6RangeRegExp} from "../validations/Subscriptions";


export default class IPBlockInput extends React.PureComponent {

	onChange = ipBlock => e => {
		ipBlock.display_value = e.target.value;
		return e.target.value;
	}
	
	validateIPRange = ipBlock => e => {
		var value = e.target.value;
		var isValid = false;
		if (value.indexOf(":")>0){
			//assume IPv6 expression
			alert("v6");
			isValid = validIPv6RangeRegExp.test(value.trim());
		} else {
			//IPv4
			isValid = validIPv4RangeRegExp.test(value.trim());
		}
	}	

    render() {
        const {ipBlock, index, clickRemove} = this.props;
        return <div><input type="text" defaultValue={ipBlock.display_value} onChange={this.onChange(ipBlock)}
			 onBlur={this.validateIPRange(ipBlock)} /><i className="fa fa-minus"
							  onClick={(e) => clickRemove(index)}></i></div>;
    }
}

IPBlockInput.propTypes = {
	clickRemove: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
    ipBlock: PropTypes.object,
	index: PropTypes.number
};
