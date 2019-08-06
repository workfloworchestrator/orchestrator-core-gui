import React from "react";
import { ping } from "../api";

import "./Help.scss";

export default class Help extends React.PureComponent {
    componentDidMount() {
        ping();
    }

    render() {
        return (
            <section className="help">
                <p>
                    <a
                        href="https://wiki.surfnet.nl/display/SNM/SURFnet+Netwerk+Management+Home"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        SURFnet Netwerk Management Wiki
                    </a>
                </p>
            </section>
        );
    }
}

Help.propTypes = {};
