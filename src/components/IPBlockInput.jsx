import React from "react";
import PropTypes from "prop-types";

import "react-select/dist/react-select.css";
import "./IPBlocks.css";


export default class IPBlockInput extends React.PureComponent {


    constructor(props, context) {
        super(props, context);
        this.state = {
            isValid: true
		};
    }
	

    render() {
        const {ipBlock, index, clickRemove, validateFunc} = this.props;
		const {isValid} = this.state;
        return <div className="ip-block"><input type="text" defaultValue={ipBlock.display_value} onBlur={validateFunc}
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
