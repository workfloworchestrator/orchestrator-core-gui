/*
 * Copyright 2019 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React from "react";
import PropTypes from "prop-types";

import "./Message.scss";
import { isEmpty } from "../utils/Utils";

export default function MessageBox({ messageHeader, messageText, handleClick, linkName }) {
    return (
        <section className="message-box">
            <h2>{messageHeader}</h2>
            <section className="message-body">
                {messageText}
                {!isEmpty(handleClick) && (
                    <button className="message-button" onClick={handleClick}>
                        {isEmpty(linkName) ? "Click here" : linkName}
                    </button>
                )}
            </section>
        </section>
    );
}

MessageBox.propTypes = {
    messageHeader: PropTypes.string.isRequired,
    messageText: PropTypes.string.isRequired,
    handleClick: PropTypes.func, // undefined -> will not render a button
    linkName: PropTypes.string
};
