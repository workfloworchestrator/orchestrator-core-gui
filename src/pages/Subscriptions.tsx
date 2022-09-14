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
import Explain from "components/Explain";
import {
    SubscriptionsTable,
    initialSubscriptionTableSettings,
    initialSubscriptionsFilterAndSort,
} from "components/tables/Subscriptions";
import ConfirmationDialogContext, {
    ConfirmDialogActions,
    ShowConfirmDialogType,
} from "contextProviders/ConfirmationDialogProvider";
import React from "react";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "utils/ApplicationContext";
import { Subscription } from "utils/types";

import { subscriptionsStyling } from "./SubscriptionsStyling";

interface IProps {}

interface IState {
    showExplanation: boolean;
    showConfirmDialog: ShowConfirmDialogType;
}

export default class SubscriptionsPage extends React.PureComponent<IProps, IState> {
    static contextType = ApplicationContext;
    context!: React.ContextType<typeof ApplicationContext>;

    constructor(props: IProps) {
        super(props);

        this.state = {
            showExplanation: false,
            showConfirmDialog: () => {},
        };
    }

    confirmation = (question: string, confirmAction: (e: React.MouseEvent) => void) =>
        this.state.showConfirmDialog({ question, confirmAction });

    showSubscription = (subscription: Subscription) => () => {
        this.context.redirect("/subscriptions/" + subscription.subscription_id);
    };

    renderActions = (subscription: Subscription) => {
        return <div>test</div>;
    };

    renderExplain() {
        return (
            <section className="explain" onClick={() => this.setState({ showExplanation: true })}>
                <i className="fa fa-question-circle" />
            </section>
        );
    }

    addConfirmDialogActions = ({ showConfirmDialog }: ConfirmDialogActions) => {
        if (this.state.showConfirmDialog !== showConfirmDialog) {
            this.setState({ showConfirmDialog });
        }
        return <></>;
    };

    render() {
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
                <ConfirmationDialogContext.Consumer>
                    {(cdc) => this.addConfirmDialogActions(cdc)}
                </ConfirmationDialogContext.Consumer>
                <EuiPageBody component="div">
                    <Explain
                        close={() => this.setState({ showExplanation: false })}
                        isVisible={this.state.showExplanation}
                        title="Subscriptions Help"
                    >
                        <h1>Subscriptions</h1>
                        <p>
                            The subscriptions are split into 2 different tables. The upper one shows all active
                            subscriptions and the lower one shows the subscriptions that are initial, provisioning or
                            terminated.
                        </p>
                        <h2>Settings storage</h2>
                        <p>
                            The tables will store the setting for your filters and columns in the local storage of your
                            browser. If you want to reset the settings to the default, click on the gear icon and then
                            on the reset button.
                        </p>
                        <h2>Using the advanced search</h2>
                        <p>
                            The advanced search allows you to search on all resource types of product types. So if you
                            know an IMS_CIRCUIT_ID or a IPAM_PREFIX_ID, then you can find it by the use of the advanced
                            search. The values in the search boxes above the columns, allow you to refine/narrow these
                            search results. It's important to remember that the advanced search will only find complete
                            words, but it will split words with "-", "," and "_".
                        </p>
                        <p>
                            For example, to search for all subscriptions of a particular customer, the search phrase
                            would be <i>"customer_id:d253130e-0a11-e511-80d0-005056956c1a"</i>. However, as the UUID is
                            unique, simply searching for <i>"d253130e-0a11-e511-80d0-005056956c1a"</i> or even
                            <i>"d253130e"</i> would probably yield the same results.
                        </p>
                        <p>
                            One can also use the keywords <i>and</i> and <i>or</i>. And one can use <i>-</i> to exclude
                            a keyword. To make sure all words in the search are found in matching order use quotes{" "}
                            <i>"</i> around the sentence. Example: <i>(star wars) or "luke skywalker" -scotty</i>{" "}
                            searches for star and wars or luke but excluding scotty.
                        </p>
                        <p>
                            The full text search can contain multiple search criteria that will AND-ed together. For
                            example
                            <i>"customer_id:d253130e-0a11-e511-80d0-005056956c1a status:active tag:IP_PREFIX"</i> would
                            only return subscriptions matching the supplied <i>customer_id</i>, <i>status</i> and{" "}
                            <i>tag</i>. Due to how full text search works that query could be simplified to:{" "}
                            <i>"d253130e active ip_prefix"</i>.
                        </p>
                        <h1>Patterns</h1>
                        <p>
                            <b>by customer:</b> customer_id:uuid
                            <br />
                            <b>by ims_circuit_id:</b> ims_circuit_id:int
                            <br />
                            <b>by ipam_prefix_id:</b> ipam_prefix_id:int
                            <br />
                            <b>by nso_service_id:</b> nso_service_ud:int
                            <br />
                            <b>by service_speed:</b> nso_service_ud:int
                            <br />
                            <b>by asn:</b> asn:int
                            <br />
                            <b>by crm_port_id:</b> crm_port_id:int
                            <br />
                        </p>
                    </Explain>
                    <div className="actions">{this.renderExplain()}</div>
                    <SubscriptionsTable
                        key={"complete"}
                        initialTableSettings={completeSettings}
                        renderActions={this.renderActions}
                        isSubscription={true}
                    />
                    <EuiSpacer />
                    <SubscriptionsTable
                        key={"provisioning"}
                        initialTableSettings={provisioningSettings}
                        renderActions={this.renderActions}
                        isSubscription={true}
                    />
                    <ScrollUpButton />
                </EuiPageBody>
            </EuiPage>
        );
    }
}
