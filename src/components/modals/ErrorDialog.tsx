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

import "components/modals/ConfirmationDialog.scss";

import {
    EuiButton,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiOverlayMask,
} from "@elastic/eui";
import React from "react";
import { FormattedMessage } from "react-intl";

import { stop } from "../../utils/Utils";

interface IProps {
    isOpen: boolean;
    close: (event: any) => void;
}

export default function ErrorDialog({ isOpen = false, close }: IProps) {
    let modal;
    if (isOpen) {
        modal = (
            <EuiOverlayMask>
                <EuiModal className="error-modal" onClose={close} initialFocus="[name=popfirst]">
                    <EuiModalHeader>
                        <EuiModalHeaderTitle>
                            <FormattedMessage id="error_dialog.title" />
                        </EuiModalHeaderTitle>
                    </EuiModalHeader>
                    <EuiModalBody>
                        <h2>
                            <FormattedMessage id="error_dialog.body" />
                        </h2>
                    </EuiModalBody>
                    <EuiModalFooter>
                        <EuiButton
                            onClick={(e: React.SyntheticEvent<Element, Event>) => {
                                stop(e);
                                close(e);
                            }}
                            fill
                            id="dialog-confirm"
                        >
                            <FormattedMessage id="error_dialog.ok" />
                        </EuiButton>
                    </EuiModalFooter>
                </EuiModal>
            </EuiOverlayMask>
        );
    }

    return <div className="confirmation-dialog-overlay">{modal}</div>;
}
