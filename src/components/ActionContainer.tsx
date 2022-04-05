import "components/ActionContainer.scss";

/*
 * Copyright 2019-2022 SURF.
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
import { EuiButtonIcon, EuiPopover } from "@elastic/eui";
import React, { useState } from "react";

function ActionContainer({
    title,
    renderButtonContent,
    renderContent,
}: {
    title: string;
    renderButtonContent: (active: boolean) => React.ReactNode;
    renderContent: (disabled: boolean) => React.ReactNode;
}) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);
    const closePopover = () => setIsPopoverOpen(false);

    const button = (
        <EuiButtonIcon
            aria-label={"actionbutton"}
            className={"action-button"}
            iconType="menu"
            onClick={onButtonClick}
        />
    );
    return (
        <div className={"action-container"}>
            <EuiPopover ownFocus button={button} isOpen={isPopoverOpen} closePopover={closePopover}>
                {renderContent(true)}
            </EuiPopover>
        </div>
    );
}

export default ActionContainer;
