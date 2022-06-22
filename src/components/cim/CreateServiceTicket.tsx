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

import {
    EuiButton,
    EuiComboBox,
    EuiFieldText,
    EuiFlexGroup,
    EuiFlexItem,
    EuiFormRow,
    EuiLoadingSpinner,
    EuiPage,
    EuiPageBody,
    EuiPanel,
    EuiRadioGroup,
    EuiSpacer,
    EuiText,
    EuiTitle,
} from "@elastic/eui";
import Explain from "components/Explain";
import { intl } from "locale/i18n";
import React, { useContext, useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";

const I18N_KEY_PREFIX = "tickets.create.";

function CreateServiceTicket() {
    const { redirect } = useContext(ApplicationContext);

    const [page, setPage] = useState(0);
    const [formInitialised, setFormInitialised] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        //get labels from ticket objects for combobox
        if (page === 0) {
        }
        console.log("useEffect");
    }, []);

    const nextPage = () => {
        setPage(page + 1);
    };

    const renderPage0 = () => {
        return <EuiLoadingSpinner></EuiLoadingSpinner>;
    };

    const renderPage1 = () => {
        return <EuiPanel>We are gonna show form here</EuiPanel>;
    };

    return (
        <EuiPage>
            <EuiPageBody component="div">
                <div className="actions">
                    <div onClick={() => setShowExplanation(true)}>
                        <i className="fa fa-question-circle" />
                    </div>
                </div>
                <Explain
                    close={() => setShowExplanation(false)}
                    isVisible={showExplanation}
                    title="How to create a CIM ticket"
                >
                    <h1>Help me</h1>
                    <p>Demo for testing help typography</p>
                    <p>
                        The full text search can contain multiple search criteria that will AND-ed together. For example
                        <i>"customer_id:d253130e-0a11-e511-80d0-005056956c1a status:active tag:IP_PREFIX"</i> would only
                        return subscriptions matching the supplied <i>customer_id</i>, <i>status</i> and <i>tag</i>. Due
                        to how full text search works that query could be simplified to:{" "}
                        <i>"d253130e active ip_prefix"</i>.
                    </p>
                </Explain>
                <EuiText grow={true}>
                    <h1>Create ticket: step {page}</h1>
                </EuiText>
                <div>
                    {page === 0 && renderPage0()}
                    {page === 1 && renderPage1()}
                </div>
            </EuiPageBody>
        </EuiPage>
    );
}

export default injectIntl(CreateServiceTicket);
