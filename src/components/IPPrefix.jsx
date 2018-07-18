import React from "react";
import Select from "react-select";
import PropTypes from "prop-types";

import {ip_blocks, prefix_filters} from "../api";

import "react-select/dist/react-select.css";
import "./IPPrefix.css";
import I18n from "i18n-js";
import {stop} from "../utils/Utils";
import {actionOptions} from "../validations/Prefixes";
import DropDownActions from "../components/DropDownActions";
import SplitPrefix from "./SplitPrefix"

export default class IPPrefix extends React.PureComponent {


    constructor(props, context) {
        super(props, context);
        this.state = {
            actions: {show: false, id: ""},
            isValid: true,
            ipBlocks: [],
            filteredIpBlocks: [],
            loading:true,
            filter_prefixes: [],
            filter: {
                state: [1,2,3],
                prefix: {'id': 0}
            },
            sorted: {
                name: "index",
                descending: false},
            selected_prefix_id: null,
            selected_prefix: "0/0",
            ipam_prefix: ""
		};
    }

    componentDidMount(){
        prefix_filters().then(result=> {
            let {filter} = this.state;
            filter['prefix'] = result[0];
            this.setState({filter_prefixes: result, filter: filter, filteredIpBlocks: this.filterAndSortBlocks()})
        });
        ip_blocks(1).then(result =>{
            this.setState({ipBlocks:result, loading: false});
        });

    }

    sort = name => e => {
        stop(e);
        const sorted = {...this.state.sorted};

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            sorted: sorted, filteredIpBlocks: this.filterAndSortBlocks()
        });
    };

    sortBy = name => (a, b) => {
        if (name==='prefix'){
            name = 'index';
        }
        const aSafe = aSafe === 0 ? aSafe : a[name] || "";
        const bSafe = bSafe === 0 ? bSafe : b[name] || "";
        try {
            return typeof aSafe === "string" && typeof bSafe === "string"
                ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
        } catch(e){
            console.log(e);
        }
    };


    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"}></i>
        }
        return <i/>;
    };

    filterState = e => {
        const state_filter = parseInt(e.target.value);
        let {filter} = this.state;
        if (e.target.checked){
            filter['state'].push(state_filter);
        } else {
            filter['state'] = filter['state'].filter(e => e !== state_filter);
        }
        this.setState({filter: filter, filteredIpBlocks:this.filterAndSortBlocks()});

    }

    filterParentPrefix = e => {
        const parentPrefix = parseInt(e.value);
        let {filter, filter_prefixes} = this.state;
        let the_prefix = {};
        filter_prefixes.forEach(prefix => the_prefix = prefix['id']==parentPrefix ? prefix : the_prefix);
        filter['prefix'] = the_prefix;
        ip_blocks(parentPrefix).then(result =>{
            this.setState({ipBlocks:result, filteredIpBlocks: this.filterAndSortBlocks(), loading: false, filter: filter});
        });
    }

    filterAndSortBlocks() {
        const {filter, sorted, ipBlocks} = this.state;
        let filteredIpBlocks = ipBlocks;
        Object.keys(filter).map((key,index) => {
            if (key=='state') {
                filteredIpBlocks = filteredIpBlocks.filter(i => filter[key].includes(i[key]))
            } else if (key==='prefix' && !(filter['prefix']['id']===0)) {
                filteredIpBlocks = filteredIpBlocks.filter(i => i['parent'] == filter['prefix']['id'])
            } else if (key !== 'prefix') {
                filteredIpBlocks = filteredIpBlocks.filter(i => i[key] == filter[key])
            }
        });
        filteredIpBlocks.sort(this.sortBy(sorted.name));
        return sorted.descending ? filteredIpBlocks.reverse() : filteredIpBlocks;
    }

    selectPrefix = (prefix) => () => {

        this.setState({selected_prefix_id: prefix['id'], selected_prefix: prefix['prefix'] });


    }

    selectIpam = prefix => {
        this.setState({ipam_prefix: prefix, isValid: true});
        this.props.onChange(prefix);
    }

    renderContent(ipBlocks, loading) {
        const columns = ["id"
            , "prefix", "description", "state_repr"];

        const {onChange} = this.props;
        const {actions, sorted, filter_prefixes, selected_prefix_id, selected_prefix} = this.state;
        const {state, prefix} = {...this.state.filter};
        let parentPrefix = prefix['id'];
        const parts = selected_prefix.split("/");
        const subnet = parts[0];
        const netmask = parts[1];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name} onClick={this.sort(name)}>
                <span>{I18n.t(`metadata.ipBlocks.${name}`)}</span> {this.sortColumnIcon(name, sorted)}
            </th>
        };
        return (
            <div>
                <div><h3>Selected prefix: {selected_prefix}</h3></div>
                <div><span>State:</span>
                    <span><input type="checkbox" name="state" onChange={this.filterState}
                                 value="1" checked={state.includes(1)}></input> 1 (Permanent toegewezen) </span>
                    <span><input type="checkbox" name="state" onChange={this.filterState}
                                 value="2" checked={state.includes(2)}></input> 2 (Gereserveerd) </span>
                    <span><input type="checkbox" name="state" onChange={this.filterState}
                                 value="3" checked={state.includes(3)}></input> 3 (Vrij) </span>
                </div>
                <div><span>Root filter</span>
                    <span>
                        <Select
                            options={filter_prefixes.map(fp => ({value: fp['id'], label: fp['prefix']}))}
                            onChange={this.filterParentPrefix} value={parentPrefix} />
                    </span>
                </div>
            <table className="ip-blocks">
                <thead>
                <tr>{columns.map((column, index) => th(index))}
                </tr>
                </thead>
                {ipBlocks.length > 0 &&
                <tbody>
                {ipBlocks.map((ipBlock, index) =>
                {let prefixrow_classname_ext = ipBlock['id']==selected_prefix_id ?
                                "selected" : ipBlock['state'] ;
                return (
                    <tr key={`${ipBlock['id']}_${index}`} onClick={this.selectPrefix(ipBlock)}
                            className={"prefixrow_" + prefixrow_classname_ext} >
                        {columns.map(column =>
                            <td data-label={column} className={column}>
                                {ipBlock[column]}
                            </td>
                        )}

                    </tr>
                    )}
                )}
                </tbody>
                }

            </table>
                {selected_prefix_id &&

                <SplitPrefix subnet={subnet} netmask={netmask} prefixlen={parseInt(netmask)}
                            onChange={this.selectIpam} />
                }
            </div>);
    }
	

    render() {
        const {ipBlock, ipBlocks, visible} = this.props;
        const {loading, selected_prefix_id} = this.state;
        let filteredIpBlocks = this.filterAndSortBlocks();
        return <section className="ipblock-selector"><div className="selected_value">{selected_prefix_id}
                    </div>{this.renderContent(filteredIpBlocks, loading)}</section> ;
    }

}

IPPrefix.propTypes = {
    ipBlock: PropTypes.object,
    onChange: PropTypes.func.isRequired
};
