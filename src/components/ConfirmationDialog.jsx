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
import Modal from "react-modal";
import I18n from "i18n-js";

import "./ConfirmationDialog.scss";

export default function ConfirmationDialog({
    isOpen = false,
    cancel,
    confirm,
    question = "",
    leavePage = false,
    isError = false
}) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={cancel}
            contentLabel={I18n.t("confirmation_dialog.title")}
            className="confirmation-dialog-content"
            overlayClassName="confirmation-dialog-overlay"
            closeTimeoutMS={250}
            appElement={document.getElementById("app")}
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

ConfirmationDialog.propTypes = {
    isOpen: PropTypes.bool,
    cancel: PropTypes.func.isRequired,
    confirm: PropTypes.func.isRequired,
    question: PropTypes.string,
    leavePage: PropTypes.bool,
    isError: PropTypes.bool
};
