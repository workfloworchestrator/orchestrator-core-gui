import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import "./Cache.scss";
import {stop} from "../utils/Utils";
import {clearCache, ping} from "../api";
import Select from "react-select";
import {setFlash} from "../utils/Flash";

export default class Cache extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            caches: ["ims", "crm", "api", "all"],
            cache: "ims"
        };
    }

    componentDidMount = () => ping();

    clearCache = e => {
        stop(e);
        clearCache(this.state.cache).then(res => setFlash(I18n.t("cache.flushed", {name: I18n.t(`cache.name.${this.state.cache}`)})));
    };

    render() {
        const {caches, cache} = this.state;
        const options = caches.map(val => ({value: val, label: I18n.t(`cache.name.${val}`)}));
        return (
            <div className="mod-cache">
                <section className="card">
                    <section className="form-step">
                        <section className="form-divider">
                            <label>{I18n.t("cache.remove")}</label>
                            <em>{I18n.t("cache.remove_info")}</em>
                            <section className="cache-select-section">
                            <Select onChange={option => this.setState({cache: option.value})}
                                    options={options}
                                    searchable={false}
                                    value={cache}
                                    clearable={false}
                                    disabled={false}/>
                            <a className="new button orange" onClick={this.clearCache}>
                                {I18n.t("cache.clear")}<i className="fa fa-eraser"></i>
                            </a>
                            </section>
                        </section>
                    </section>
                </section>
            </div>
        );
    }
}

Cache.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
};
