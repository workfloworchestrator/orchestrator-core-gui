import React from "react";
import PopUp from "reactjs-popup";
import PropTypes from "prop-types";

import "react-select/dist/react-select.css";
import "./IPBlockSelector.css";


export default class IPBlockSelector extends React.PureComponent {


    constructor(props, context) {
        super(props, context);
        this.state = {
            isValid: true
		};
    }

    componentDidMount(){

    }

    renderButton(){
        return <button>Select IP Block</button>;
    }

    renderContent(){
        return <section>Content here</section>;
    }
	

    render() {
        const {ipBlock, index, clickRemove, validateFunc} = this.props;
        const {isValid} = this.state;
        const {compName} = "ip_block" + index;
        return <section className="ipblock-selector"><div className="selected_value">selected value: {ipBlock['display_value'] }
                    </div> <PopUp modal position="top left"
                                  name="{compName}" className="ipspace_popup" trigger={this.renderButton}>
            {this.renderContent}</PopUp></section> ;
    }

}

IPBlockSelector.propTypes = {
    ipBlock: PropTypes.object,
	index: PropTypes.number,
    visible: PropTypes.bool
};
