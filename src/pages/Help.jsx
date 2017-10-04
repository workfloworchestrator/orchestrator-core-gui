import React from "react";
import {ping} from "../api";

import "./Help.css";

export default class Help extends React.PureComponent {

    componentDidMount() {
        ping();
    }

    render() {
        return (<section className="help">
                <p>TODO</p>
            </section>
        );
    }
}

Help.propTypes = {};


