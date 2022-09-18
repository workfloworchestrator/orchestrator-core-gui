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

import { EuiPage, EuiPageBody, EuiSpacer } from "@elastic/eui";
import DropDownActions from "components/DropDownActions";
import Explain from "components/Explain";
import {
    ProcessesTable,
    initialProcessTableSettings,
    initialProcessesFilterAndSort,
} from "components/tables/Processes";
import ConfirmationDialogContext from "contextProviders/ConfirmationDialogProvider";
import { intl } from "locale/i18n";
import { processesStyling } from "pages/ProcessesStyling";
import React, { useContext, useState } from "react";
import { injectIntl } from "react-intl";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { organisationNameByUuid } from "utils/Lookups";
import { ProcessStatus, ProcessV2 } from "utils/types";
import { stop } from "utils/Utils";
import { actionOptions } from "validations/Processes";

function Processes() {
    const { apiClient, redirect, allowed, organisations } = useContext(ApplicationContext);
    const { showConfirmDialog } = useContext(ConfirmationDialogContext);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const confirmation = (question: string, confirmAction: (e: React.MouseEvent) => void) =>
        showConfirmDialog({ question, confirmAction });

    const handleAbortProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const product_name = process.subscriptions[0].product.name;
        const customer_name = organisationNameByUuid(process.subscriptions[0].customer_id, organisations);
        confirmation(
            intl.formatMessage({ id: "processes.abortConfirmation" }, { name: product_name, customer: customer_name }),
            () =>
                apiClient.abortProcess(process.pid).then(() => {
                    setFlash(intl.formatMessage({ id: "processes.flash.abort" }, { name: product_name }));
                })
        );
    };

    const handleRetryProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const product_name = process.subscriptions[0].product.name;
        const customer_name = organisationNameByUuid(process.subscriptions[0].customer_id, organisations);
        confirmation(
            intl.formatMessage({ id: "processes.retryConfirmation" }, { name: product_name, customer: customer_name }),
            () =>
                apiClient.retryProcess(process.pid).then(() => {
                    setFlash(intl.formatMessage({ id: "processes.flash.retry" }, { name: product_name }));
                })
        );
    };

    const showProcess = (process: ProcessV2) => () => {
        redirect("/processes/" + process.pid);
    };

    const renderActions = (process: ProcessV2) => {
        let options = actionOptions(
            allowed,
            process,
            showProcess(process),
            handleRetryProcess(process),
            () => null,
            handleAbortProcess(process)
        );
        return <DropDownActions options={options} i18nPrefix="processes.actions" />;
    };

    const renderExplain = () => {
        return (
            <section className="explain">
                <i className="fa fa-question-circle" onClick={() => setShowExplanation(true)} />
            </section>
        );
    };

    const activeSettings = initialProcessTableSettings(
        "table.processes.active",
        initialProcessesFilterAndSort(false, [
            ProcessStatus.RUNNING,
            ProcessStatus.SUSPENDED,
            ProcessStatus.FAILED,
            ProcessStatus.CREATED,
            ProcessStatus.WAITING,
        ]),
        ["pid", "assignee", "tag", "creator", "customer", "product"],
        { showSettings: false, pageSize: 10, refresh: false }
    );
    const completedSettings = initialProcessTableSettings(
        "table.processes.completed",
        initialProcessesFilterAndSort(false, [ProcessStatus.COMPLETED]),
        ["pid", "step", "status", "assignee", "creator", "started", "abbrev"],
        { showSettings: false, pageSize: 5, refresh: false }
    );

    return (
        <EuiPage css={processesStyling}>
            <EuiPageBody component="div" className="process-container">
                <Explain close={() => setShowExplanation(false)} isVisible={showExplanation} title="Processes Help">
                    <h1>Processes</h1>
                    <p>
                        The processes are split into 2 different tables. The upper one shows all active processes and
                        the lower one shows processes that are done/complete.
                    </p>
                    <h2>Settings storage</h2>
                    <p>
                        The tables will store the setting for your filters and columns in the local storage of your
                        browser. If you want to reset the settings to the default, click on the gear icon and then on
                        the reset button.
                    </p>
                </Explain>
                <div className="actions">{renderExplain()}</div>
                <ProcessesTable key={"active"} initialTableSettings={activeSettings} renderActions={renderActions} />
                <EuiSpacer />
                <ProcessesTable
                    key={"completed"}
                    initialTableSettings={completedSettings}
                    renderActions={renderActions}
                />
                <ScrollUpButton />
            </EuiPageBody>
        </EuiPage>
    );
}

export default injectIntl(Processes);
