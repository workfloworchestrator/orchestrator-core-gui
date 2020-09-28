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
import "components/tables/DropDownContainer.scss";

import React, { useState } from "react";

function DropDownContainer({
    title,
    renderButtonContent,
    renderContent
}: {
    title: string;
    renderButtonContent: (active: boolean, hover: boolean) => React.ReactNode;
    renderContent: (disabled: boolean, reset: () => void) => React.ReactNode;
}) {
    const [active, setActive] = useState(false);
    const [hover, setHover] = useState(false);

    return (
        <div className={"dropdown-container"}>
            <button
                className={"dropdown-button"}
                onClick={e => {
                    e.stopPropagation();
                    if (active) {
                        setActive(false);
                        setHover(false);
                    } else {
                        setActive(true);
                    }
                }}
            >
                {renderButtonContent(active, hover)}
            </button>
            <div
                className={active ? "dropdown open" : hover ? "dropdown open" : "dropdown"}
                onClick={e => {
                    e.stopPropagation();
                    if (!active) {
                        setActive(true);
                    }
                }}
            >
                {(active || hover) && renderContent(!active, () => setActive(false))}
            </div>
        </div>
    );
}

export default DropDownContainer;
