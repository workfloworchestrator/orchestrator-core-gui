import React from "react";
import PropTypes from "prop-types";

import "react-select/dist/react-select.css";
import "./IPBlocks.css";

import {validateIPRange} from "../validations/Subscriptions.js"

export default class IPBlockInput extends React.PureComponent {


    constructor(props, context) {
        super(props, context);
        this.state = {
            isValid: true
		};
    }

	onChange = ipBlock => e => {
		var value = e.target.value;
		ipBlock.display_value = value;
	}
	
	validate = ipBlock => e => {
		var value = e.target.value;
		var isValid = validateIPRange(value);
		this.setState({isValid: isValid});
		alert("val van IPBI");
		this.props.validateFunc(this);
		
	}

    render() {
        const {ipBlock, index, clickRemove} = this.props;
		const {isValid} = this.state;
        return <div className="ip-block"><input type="text" defaultValue={ipBlock.display_value} onBlur={this.validate(ipBlock)}
			  />
				{index>0 && <i className="fa fa-minus"
							  onClick={(e) => clickRemove(index)}></i> }
							  {!isValid && <em className="error">foutje</em> }
							  </div>;
    }
}

IPBlockInput.propTypes = {
	clickRemove: PropTypes.func.isRequired,
    ipBlock: PropTypes.object,
	index: PropTypes.number,
	validateFunc: PropTypes.func.isRequired
};
