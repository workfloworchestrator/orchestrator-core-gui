import React from "react";
import PopUp from "reactjs-popup";
import PropTypes from "prop-types";

import {ip_blocks, subscriptions} from "../api";

import "react-select/dist/react-select.css";
import "./IPBlockSelector.css";
import I18n from "i18n-js";
import {renderDateTime} from "../utils/Lookups";


export default class IPBlockSelector extends React.PureComponent {


    constructor(props, context) {
        super(props, context);
        this.state = {
            isValid: true,
            ipBlocks: [],
            loading:true
		};
    }

    componentDidMount(){
        ip_blocks().then(result =>{
            this.setState({ipBlocks:result, loading: false});
        });
    }

    renderButton(){
        return <button>Select IP Block</button>;
    }

    renderContent(ipBlocks, loading){
        //return ipBlocks.map(ipBlock => <section>{ipBlock['id']} {ipBlock['prefix']}</section>);
            const columns = ["id", "prefix"];
            const th = index => {
                const name = columns[index];
                return <th key={index} className={name} >
                    <span>{I18n.t(`metadata.ipBlocks.${name}`)}</span>
                    +
                </th>
            };
            if (ipBlocks.length !== 0) {
                return (
                    <table className="product-blocks">
                        <thead>
                        <tr>{columns.map((column, index) => th(index))}</tr>
                        </thead>
                        <tbody>
                        {ipBlocks.map((ipBlock, index) =>
                            <tr key={`${ipBlock['id']}_${index}`}
                            >
                                <td data-label="id" className="name">
                                    {ipBlock['id']}
                                </td>
                                <td data-label="prefix" className="description">
                                    {ipBlock['prefix']}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                );
            }
    }
	

    render() {
        const {ipBlock, index, clickRemove, validateFunc} = this.props;
        const {isValid, ipBlocks, loading} = this.state;
        return <section className="ipblock-selector"><div className="selected_value">{ipBlock['prefix']}
                    </div> <PopUp modal position="top left"
                                  name="ipBlock_id" className="ipspace_popup" trigger={this.renderButton}>
            {this.renderContent(ipBlocks, loading)}</PopUp></section> ;
    }

}

IPBlockSelector.propTypes = {
    ipBlock: PropTypes.object,
    iBlocks: PropTypes.array,
	index: PropTypes.number,
    visible: PropTypes.bool
};
