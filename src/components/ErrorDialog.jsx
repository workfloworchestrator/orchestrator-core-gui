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

import "./ConfirmationDialog.scss";

import I18n from "i18n-js";
import PropTypes from "prop-types";
import React from "react";
import Modal from "react-modal";

import { stop } from "../utils/Utils";

export default function ErrorDialog({ isOpen = false, close }) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={close}
            contentLabel={I18n.t("error_dialog.title")}
            className="confirmation-dialog-content"
            overlayClassName="confirmation-dialog-overlay"
            closeTimeoutMS={250}
            appElement={document.getElementById("app")}
        >
            <section className="dialog-header error">{I18n.t("error_dialog.title")}</section>
            <section className="dialog-content">
                <h2>{I18n.t("error_dialog.body")}</h2>
            </section>
            <section className="dialog-buttons">
                <button
                    className="button blue error"
                    onClick={e => {
                        stop(e);
                        close(e);
                    }}
                >
                    {I18n.t("error_dialog.ok")}
                </button>
            </section>
        </Modal>
    );
}

ErrorDialog.propTypes = {
    isOpen: PropTypes.bool,
    close: PropTypes.func.isRequired
};
