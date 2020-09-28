/*
 * Copyright 2019-2020 SURF.
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

import "components/Flash.scss";

import React from "react";
import { FlashData, clearFlash, emitter, getFlash } from "utils/Flash";
import { isEmpty } from "utils/Utils";

interface IState {
    flash?: FlashData;
    className: string;
    type: string;
}

export default class Flash extends React.PureComponent<{}, IState> {
    state: IState = { className: "hide", type: "info" };
    callback = (flash: FlashData | null) => {
        this.setState({
            flash: flash ?? undefined,
            className: isEmpty(flash?.message) ? "hide" : ""
        });
        if (flash && (!flash.type || flash.type !== "error")) {
            setTimeout(() => this.setState({ className: "hide" }), flash.type === "info" ? 5000 : 7500);
        }
    };

    componentDidMount() {
        this.callback(getFlash());
        emitter.addListener("flash", this.callback);
    }

    componentWillUnmount() {
        emitter.removeListener("flash", this.callback);
    }

    render() {
        const { flash, className } = this.state;
        return (
            <div className={`flash ${className} ${flash?.type}`}>
                <div className="message-container">
                    <p>{flash?.message}</p>
                    <button className="close" onClick={clearFlash}>
                        <i className="fas fa-times" />
                    </button>
                </div>
            </div>
        );
    }
}
