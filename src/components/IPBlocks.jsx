import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";

import "./IPBlocks.css";
import IPBlockInput from "./IPBlockInput";
import IPBlockSelector from "./IPBlockSelector";

export default class IPBlocks extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            errors: {},
			showSelector: false
        };
    };

    render() {
		const ipBlock = [...this.props.ipBlock];
        return (<section className="ip-blocks">
            <div className="wrapper ipp-select" >
				<span>Selected prefix: {this.state.ipBlock && <span>{this.state.ipBlock.prefix}</span>}</span>
			<IPBlockSelector
					ipBlock={ipBlock}
					visible={this.state.showSelector}
					/>
			</div>
		</section>)
    }
}

IPBlocks.propTypes = {
	ipBlock: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired
};
