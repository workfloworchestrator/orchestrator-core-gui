import { EuiFlexItem } from "@elastic/eui";
import React, { useState } from "react";

/*
 * Copyright 2019-2023 SURF.
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
import { dropDownContainerStyling } from "./DropDownContainerStyling";

function DropDownContainer({
    title,
    renderButtonContent,
    renderContent,
}: {
    title: string;
    renderButtonContent: (active: boolean, hover: boolean) => React.ReactNode;
    renderContent: (disabled: boolean, reset: () => void) => React.ReactNode;
}) {
    const [active, setActive] = useState(false);
    const [hover, setHover] = useState(false);

    return (
        <EuiFlexItem css={dropDownContainerStyling}>
            <div className={"dropdown-container"}>
                <button
                    className={"dropdown-button"}
                    onClick={(e) => {
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
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!active) {
                            setActive(true);
                        }
                    }}
                >
                    {(active || hover) && renderContent(!active, () => setActive(false))}
                </div>
            </div>
        </EuiFlexItem>
    );
}

export default DropDownContainer;
