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

import "components/ConfirmationDialog.scss";

import I18n from "i18n-js";
import React from "react";
import Modal from "react-modal";

interface IProps {
    isOpen?: boolean;
    cancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
    confirm: (e: React.MouseEvent<HTMLButtonElement>) => void;
    question?: string;
    leavePage?: boolean;
    isError?: boolean;
}

export default function ConfirmationDialog({
    isOpen = false,
    cancel,
    confirm,
    question = "",
    leavePage = false,
    isError = false
}: IProps) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={cancel}
            contentLabel={I18n.t("confirmation_dialog.title")}
            className="confirmation-dialog-content"
            overlayClassName="confirmation-dialog-overlay"
            closeTimeoutMS={250}
            appElement={document.getElementById("app")!}
        >
            <section className="dialog-header">{I18n.t("confirmation_dialog.title")}</section>
            {leavePage ? (
                <section className={`dialog-content ${isError ? " error" : ""}`}>
                    <h2>{I18n.t("confirmation_dialog.leavePage")}</h2>
                    <p>{I18n.t("confirmation_dialog.leavePageSub")}</p>
                </section>
            ) : (
                <section className="dialog-content">
                    <h2>{question}</h2>
                </section>
            )}
            <section className="dialog-buttons">
                <button id="dialog-cancel" className="button" onClick={cancel}>
                    {leavePage ? I18n.t("confirmation_dialog.leave") : I18n.t("confirmation_dialog.cancel")}
                </button>
                <button id="dialog-confirm" className="button blue" onClick={confirm}>
                    {leavePage ? I18n.t("confirmation_dialog.stay") : I18n.t("confirmation_dialog.confirm")}
                </button>
            </section>
        </Modal>
    );
}
