import React from "react";
import PopUp from "reactjs-popup";
import PropTypes from "prop-types";

import "react-select/dist/react-select.css";
import "./IPBlocks.css";


export default class IPBlockSelector extends React.PureComponent {


    constructor(props, context) {
        super(props, context);
        this.state = {
            isValid: true
		};
    }
	

    render() {
        const {ipBlock, index, clickRemove, validateFunc} = this.props;
        const {isValid} = this.state;
        const {compName} = "ip_block" + index;
        return <PopUp position="top left" name="{compName}" trigger={<button>Trigger</button>}>
            {close => (
                <div>Content here
                    <a className="close" onClick={close}>
                        &times;
                    </a>
                </div>

            )
            }</PopUp>;
    }

}

IPBlockSelector.propTypes = {
    ipBlock: PropTypes.object,
	index: PropTypes.number,
    visible: PropTypes.bool
};
