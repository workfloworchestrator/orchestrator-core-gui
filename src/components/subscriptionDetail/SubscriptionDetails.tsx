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

import {
    EuiButton,
    EuiConfirmModal,
    EuiCopy,
    EuiFlexGroup,
    EuiFlexItem,
    EuiIcon,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
} from "@elastic/eui";
import { FAVORITE_STORAGE_KEY } from "components/modals/components/FavoritePortSelector";
import React, { useContext, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useStorageState } from "react-storage-hooks";
import ApplicationContext, { apiClient } from "utils/ApplicationContext";
import { organisationNameByUuid, renderDate } from "utils/Lookups";
import { FavoriteSubscriptionStorage, SubscriptionModel, SubscriptionProcesses } from "utils/types";

function renderFailedTask(subscriptionProcesses: SubscriptionProcesses[]) {
    let failed_tasks = subscriptionProcesses
        .map((sp) => sp.process)
        .filter((process) => process.last_status !== "completed");

    if (failed_tasks.length)
        return (
            <a target="_blank" rel="noopener noreferrer" href={`/task/${failed_tasks[0].pid}`}>
                <FormattedMessage id="subscriptions.failed_task" values={failed_tasks[0] as any} />
            </a>
        );
}
interface IProps {
    subscription: SubscriptionModel;
    className?: string;
    subscriptionProcesses?: SubscriptionProcesses[];
}

export default function SubscriptionDetails({ subscription, className = "", subscriptionProcesses = [] }: IProps) {
    const { organisations } = useContext(ApplicationContext);
    // handle global errors
    const [errorMessage, setErrorMessage] = useState("");
    const closeErrorModal = () => {
        setIsErrorModalVisible(false);
        setErrorMessage("");
    };
    const showErrorModal = () => setIsErrorModalVisible(true);
    // handle insync errors
    const [isInsyncModalVisible, setIsInsyncModalVisible] = useState(false);
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const closeInsyncModal = () => setIsInsyncModalVisible(false);
    const showInsyncModal = () => setIsInsyncModalVisible(true);

    const [favoritesList, setFavoritesList] = useStorageState<FavoriteSubscriptionStorage[]>(
        localStorage,
        FAVORITE_STORAGE_KEY,
        []
    );

    function isCurrentlyFavorited(subscription_id: string) {
        const v = favoritesList.find((s) => s.subscription_id === subscription_id);
        return v !== undefined;
    }

    function handleSetInSync() {
        closeInsyncModal();
        apiClient
            .setInSyncSubscription(subscription.subscription_id)
            .then(() => {
                closeInsyncModal();
                window.location.reload();
            })
            .catch((error) => {
                if (error.response.status === 422) {
                    debugger;
                    setErrorMessage(error.response.data.detail);
                    showErrorModal();
                } else {
                    setErrorMessage(`Unhandled error occured, with HTTP error code: ${error.response.status}`);
                    showErrorModal();
                }
            });
    }

    const customer_name = organisationNameByUuid(subscription.customer_id, organisations);
    return (
        <>
            {isErrorModalVisible && (
                <EuiModal onClose={closeErrorModal}>
                    <EuiModalHeader>
                        <EuiModalHeaderTitle>
                            <h1>An error ocurred</h1>
                        </EuiModalHeaderTitle>
                    </EuiModalHeader>

                    <EuiModalBody>{errorMessage}</EuiModalBody>

                    <EuiModalFooter>
                        <EuiButton onClick={closeErrorModal} fill>
                            Close
                        </EuiButton>
                    </EuiModalFooter>
                </EuiModal>
            )}
            {isInsyncModalVisible && (
                <EuiConfirmModal
                    title="Set subscription insync?"
                    onCancel={closeInsyncModal}
                    onConfirm={handleSetInSync}
                    cancelButtonText="No, don't do it"
                    confirmButtonText="Yes, do it"
                    buttonColor="danger"
                    defaultFocusedButton="cancel"
                >
                    <p>Are you sure you want to do this?</p>
                    <p>
                        You're about to force a subscription in sync. When it's clear why the subscription is out of
                        sync this could enable you to start or finish a change on this subscription. When you're in
                        doubt, please consult the network automators first as running workflows on subscriptions that
                        are not in sync can potentially do great harm to the network.
                    </p>
                </EuiConfirmModal>
            )}
            <table className={`detail-block ${className}`}>
                <thead />
                <tbody>
                    <tr>
                        <td id="subscriptions-id-k">
                            <FormattedMessage id="subscriptions.id" />
                        </td>
                        <td id="subscriptions-id-v">
                            <EuiFlexGroup>
                                <EuiFlexItem grow={false}>
                                    <a
                                        href={`/subscriptions/${subscription.subscription_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {subscription.subscription_id}
                                    </a>
                                </EuiFlexItem>
                                <EuiFlexItem grow={false}>
                                    <EuiCopy textToCopy={subscription.subscription_id}>
                                        {(copy) => (
                                            <EuiButton
                                                fill
                                                id="subscriptions-copy-button"
                                                iconType="copyClipboard"
                                                size="s"
                                                onClick={copy}
                                            >
                                                Copy ID
                                            </EuiButton>
                                        )}
                                    </EuiCopy>
                                </EuiFlexItem>
                                <EuiFlexItem grow={false}>
                                    <EuiButton
                                        fill
                                        id="subscriptions-favorite-toggle"
                                        iconType="filter"
                                        size="s"
                                        onClick={() => {
                                            const new_list = isCurrentlyFavorited(subscription.subscription_id)
                                                ? favoritesList.filter(
                                                      (item) => item.subscription_id !== subscription.subscription_id
                                                  )
                                                : favoritesList.concat([
                                                      {
                                                          subscription_id: subscription.subscription_id,
                                                          customName: "",
                                                      },
                                                  ]);
                                            setFavoritesList(new_list);
                                        }}
                                    >
                                        <FormattedMessage
                                            id={
                                                isCurrentlyFavorited(subscription.subscription_id)
                                                    ? "favorites.remove"
                                                    : "favorites.add"
                                            }
                                        />
                                    </EuiButton>
                                </EuiFlexItem>
                            </EuiFlexGroup>
                        </td>
                    </tr>
                    <tr>
                        <td id="subscriptions-name-k">
                            <FormattedMessage id="subscriptions.name" />
                        </td>
                        <td id="subscriptions-name-v">{subscription.product?.name}</td>
                    </tr>
                    <tr>
                        <td id="subscriptions-description-k">
                            <FormattedMessage id="subscriptions.description" />
                        </td>
                        <td id="subscriptions-description-v">{subscription.description}</td>
                    </tr>
                    <tr>
                        <td id="subscriptions-startdate-k">
                            <FormattedMessage id="subscriptions.start_date_epoch" />
                        </td>
                        <td id="subscriptions-startdate-v">{renderDate(subscription.start_date)}</td>
                    </tr>
                    <tr>
                        <td id="subscriptions-enddate-k">
                            <FormattedMessage id="subscriptions.end_date_epoch" />
                        </td>
                        <td id="subscriptions-enddate-v">{renderDate(subscription.end_date)}</td>
                    </tr>
                    <tr>
                        <td id="subscriptions-status-k">
                            <FormattedMessage id="subscriptions.status" />
                        </td>
                        <td id="subscriptions-status-v">{subscription.status}</td>
                    </tr>
                    <tr>
                        <td id="subscriptions-insync-k">
                            <FormattedMessage id="subscriptions.insync" />
                        </td>
                        <td id="subscriptions-insync-v">
                            <EuiFlexGroup>
                                <EuiFlexItem grow={false}>
                                    {subscription.insync ? (
                                        <EuiIcon type={"check"} size={"l"} />
                                    ) : (
                                        <EuiIcon type={"alert"} size={"l"} color={"danger"} />
                                    )}
                                </EuiFlexItem>
                                {!subscription.insync && (
                                    <EuiFlexItem grow={false}>{renderFailedTask(subscriptionProcesses)}</EuiFlexItem>
                                )}
                                <EuiFlexItem grow={false}>
                                    {!subscription.insync && (
                                        <EuiButton
                                            fill
                                            id="subscriptions-insync-button"
                                            iconType="refresh"
                                            size="s"
                                            color={"danger"}
                                            onClick={showInsyncModal}
                                        >
                                            Set in sync
                                        </EuiButton>
                                    )}
                                </EuiFlexItem>
                            </EuiFlexGroup>
                        </td>
                    </tr>
                    {customer_name && customer_name !== subscription.customer_id && (
                        <tr>
                            <td id="subscriptions-customer-name-k">
                                <FormattedMessage id="subscriptions.customer_name" />
                            </td>
                            <td id="subscriptions-customer-name-v">{customer_name}</td>
                        </tr>
                    )}
                    <tr>
                        <td id="subscriptions-customer-id-k">
                            <FormattedMessage id="subscriptions.customer_id" />
                        </td>
                        <td id="subscriptions-customer-id-v">{subscription.customer_id}</td>
                    </tr>
                    {subscription.customer_descriptions && (
                        <tr>
                            <td id="subscriptions-customer-descriptions-k">
                                <FormattedMessage id="subscriptions.customer_descriptions" />
                            </td>
                            <td id="subscriptions-customer-descriptions-v">
                                <dl>
                                    {subscription.customer_descriptions.map((description, index) => (
                                        <React.Fragment key={index}>
                                            <dt>{organisationNameByUuid(description.customer_id, organisations)}</dt>
                                            <dd>{description.description}</dd>
                                        </React.Fragment>
                                    ))}
                                </dl>
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td id="subscriptions-note-k">
                            <FormattedMessage id="subscriptions.note" />
                        </td>
                        <td id="subscriptions-note-v">{subscription.note}</td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}
