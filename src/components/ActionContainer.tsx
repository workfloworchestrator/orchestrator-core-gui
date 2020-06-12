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
import "./ActionContainer.scss";

import React, { useState } from "react";

function ActionContainer({
    title,
    renderButtonContent,
    renderContent
}: {
    title: string;
    renderButtonContent: (active: boolean) => React.ReactNode;
    renderContent: (disabled: boolean) => React.ReactNode;
}) {
    const [active, setActive] = useState(false);
    return (
        <div className={"action-container"}>
            <button
                className={"action-button"}
                onClick={e => {
                    e.stopPropagation();
                    if (active) {
                        setActive(false);
                    } else {
                        setActive(true);
                    }
                }}
            >
                {renderButtonContent(active)}
            </button>
            <div
                className={active ? "action-dialog open" : "action-dialog"}
                onClick={e => {
                    e.stopPropagation();
                    if (!active) {
                        setActive(true);
                    }
                }}
            >
                {active && renderContent(!active)}
            </div>
        </div>
    );
}

export default ActionContainer;
