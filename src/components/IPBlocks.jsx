import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";

import "./IPBlocks.css";
import IPBlockInput from "./IPBlockInput";

export default class IPBlocks extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            errors: {},
        };
    };

    validateInternal = (name, index) => e => {
		let value;
		const ipBlocks = [...this.props.ipBlocks];
	 	value = e.target ? e.target.value : null;
		ipBlocks[index] = {ipam_prefix_id: "", error_msg: "", display_value: value};
		this.props.onChange(ipBlocks);
    };

	addIPBlock = () => {
		const ipBlocks = [...this.props.ipBlocks];
		ipBlocks.push({ipam_prefix_id:"", error_msg:"", display_value:""});
		this.props.onChange(ipBlocks);
	};

	contentChanged = () => {
		alert("constantChanged");
	};

	clickRemove = index => e => {
		//stop(e);
		const ipBlocks = [...this.props.ipBlocks];
		ipBlocks.splice(index,1);
		this.props.onChange(ipBlocks);
		
	};

    renderIPBlock = (index, ipBlock) => {
		const {onChange} = this.props;
        return (<section className="ip-block" key={index}>
            <div className="wrapper ipp-select" >
                {index === 0 && <label>{I18n.t("ip_blocks.ip_block")}</label>}
                <IPBlockInput 
					ipBlock={ipBlock}
					clickRemove={this.clickRemove(index)}
					validateFunc={this.validateInternal("display_value", index)}
					index = {index} />
            </div>

        </section>)
    };

    render() {
		const ipBlocks = [...this.props.ipBlocks];
        return (<section className="ip-blocks">
            {ipBlocks.map((ipBlock, index) =>
                this.renderIPBlock(index, ipBlock))}
            <div className="add-ip-block"><i className="fa fa-plus" onClick={this.addIPBlock}></i></div>
        </section>)
    }
}

IPBlocks.propTypes = {
	ipBlocks: PropTypes.array.isRequired,
	onChange: PropTypes.func.IsRequired
};
