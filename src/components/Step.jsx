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
import { capitalize, renderDateTime } from "../utils/Lookups";
import "./Step.scss";

export default class Step extends React.PureComponent {
    render() {
        const { step } = this.props;
        return (
            <section className={`step ${step.status}`}>
                <span className="name">{step.name}</span>
                <span className="status">{capitalize(step.status)}</span>
                {step.executed && <span className="started">{renderDateTime(step.executed)}</span>}
            </section>
        );
    }
}

Step.propTypes = {
    step: PropTypes.object.isRequired
};
