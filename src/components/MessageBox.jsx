import I18n from "i18n-js";
import React from "react";
import PropTypes from "prop-types";

import "./Message.scss"
import {isEmpty} from "../utils/Utils";

export default function MessageBox({messageHeader,messageText,handleClick,linkName}) {
    return (
        <section className="message-box">
            <h2>{messageHeader}</h2>
            <section className="message-body">
                {messageText}
                {!isEmpty(handleClick) &&
                    <button className="message-button" onClick={handleClick}>{isEmpty(linkName) ? "Click here" : linkName}</button>
                }
            </section>
        </section>
    )
}

MessageBox.propTypes = {
    messageHeader: PropTypes.string.isRequired,
    messageText: PropTypes.string.isRequired,
    handleClick: PropTypes.func, // undefined -> will not render a button
    linkName: PropTypes.string
};


