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

import { EuiPage, EuiPageBody, EuiSpacer } from "@elastic/eui";
import Explain from "components/Explain";
import {
    SubscriptionsTable,
    initialSubscriptionTableSettings,
    initialSubscriptionsFilterAndSort,
} from "components/tables/Subscriptions";
import React, { useState } from "react";
import ScrollUpButton from "react-scroll-up-button";
import { Subscription } from "utils/types";

import { subscriptionsStyling } from "./SubscriptionsStyling";

interface IProps {}

export default function SubscriptionsPage(props: IProps) {
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const renderActions = (subscription: Subscription) => {
        return <div>test</div>;
    };

    const renderExplain = () => {
        return (
            <section className="explain" onClick={() => setShowExplanation(true)}>
                <i className="fa fa-question-circle" />
            </section>
        );
    };

    const completeSettings = initialSubscriptionTableSettings(
        "table.subscriptions.complete",
        initialSubscriptionsFilterAndSort(false, ["active"]),
        ["product", "customer"],
        { showSettings: false, refresh: false, pageSize: 10 }
    );
    const provisioningSettings = initialSubscriptionTableSettings(
        "table.subscriptions.provisioning",
        initialSubscriptionsFilterAndSort(false, ["provisioning", "initial", "terminated"]),
        ["start_date", "customer", "end_date", "insync"],
        { showSettings: false, refresh: false, pageSize: 5 }
    );

    return (
        <EuiPage css={subscriptionsStyling}>
            <EuiPageBody component="div">
                <Explain close={() => setShowExplanation(false)} isVisible={showExplanation} title="Subscriptions Help">
                    <h1>Subscriptions</h1>
                    <p>
                        The subscriptions are split into 2 different tables. The upper one shows all active
                        subscriptions and the lower one shows the subscriptions that are initial, provisioning or
                        terminated.
                    </p>
                    <h2>Settings storage</h2>
                    <p>
                        The tables will store the setting for your filters and columns in the local storage of your
                        browser. If you want to reset the settings to the default, click on the gear icon and then on
                        the reset button.
                    </p>
                    <h2>Using the advanced search</h2>
                    <p>
                        The advanced search allows you to search on all resource types of product types. So if you know
                        an IMS_CIRCUIT_ID or a IPAM_PREFIX_ID, then you can find it by the use of the advanced search.
                        The values in the search boxes above the columns, allow you to refine/narrow these search
                        results. It's important to remember that the advanced search will only find complete words, but
                        it will split words with "-", "," and "_".
                    </p>
                    <p>
                        For example, to search for all subscriptions of a particular customer, the search phrase would
                        be <i>"customer_id:d253130e-0a11-e511-80d0-005056956c1a"</i>. However, as the UUID is unique,
                        simply searching for <i>"d253130e-0a11-e511-80d0-005056956c1a"</i> or even
                        <i>"d253130e"</i> would probably yield the same results.
                    </p>
                    <p>
                        If multiple keywords are entered, the results will be filtered by subscriptions with all
                        keywords matching. One can also use the keyword <i>or</i> to form a disjunctive query. And one
                        can use <i>-</i> to exclude a keyword. To make sure all words in the search are found in
                        matching order use quotes <i>"</i> around the sentence. Example: <i>"luke skywalker" -scotty</i>{" "}
                        searches for "luke skywalker" but excluding scotty.
                    </p>
                    <p>
                        The full text search can contain multiple search criteria that will AND-ed together. For example
                        <i>"customer_id:d253130e-0a11-e511-80d0-005056956c1a status:active tag:IP_PREFIX"</i> would only
                        return subscriptions matching the supplied <i>customer_id</i>, <i>status</i> and <i>tag</i>. Due
                        to how full text search works that query could be simplified to:{" "}
                        <i>"d253130e active ip_prefix"</i>.
                    </p>
                </Explain>
                <div className="actions">{renderExplain()}</div>
                <SubscriptionsTable
                    key={"complete"}
                    initialTableSettings={completeSettings}
                    renderActions={renderActions}
                    isSubscription={true}
                />
                <EuiSpacer />
                <SubscriptionsTable
                    key={"provisioning"}
                    initialTableSettings={provisioningSettings}
                    renderActions={renderActions}
                    isSubscription={true}
                />
                <ScrollUpButton />
            </EuiPageBody>
        </EuiPage>
    );
}
