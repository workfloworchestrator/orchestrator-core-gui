/*
 * Copyright 2019 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the Licene
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import "./Subscriptions.scss";

import {
    SubscriptionsTable,
    initialSubscriptionTableSettings,
    initialSubscriptionsFilterAndSort
} from "components/tables/Subscriptions";
import I18n from "i18n-js";
import React from "react";
import ScrollUpButton from "react-scroll-up-button";

import ConfirmationDialog from "../components/ConfirmationDialog";
import DropDownActions from "../components/DropDownActions";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { organisationNameByUuid } from "../utils/Lookups";
import { Subscription } from "../utils/types";
import { stop } from "../utils/Utils";

// TODO investigate dynamic actions : start, stop workflows
// import { actionOptions } from "../validations/Subscriptions";

interface IProps {}

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: (e: React.MouseEvent) => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
}

export default class SubscriptionsPage extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: ""
        };
    }

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    confirmation = (question: string, action: (e: React.MouseEvent) => void) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: (e: React.MouseEvent) => {
                this.cancelConfirmation();
                action(e);
            }
        });

    showSubscription = (subscription: Subscription) => () => {
        this.context.redirect("/subscription/" + subscription.subscription_id);
    };

    renderActions = (subscription: Subscription) => {
        // let options = actionOptions(
        //     subscription,
        //     this.showSubscription(subscription),
        //     () => null,
        // );
        // return <DropDownActions options={options} i18nPrefix="subscriptions" />;
        return <div>test</div>;
    };

    render() {
        const activeSettings = initialSubscriptionTableSettings(
            "table.subscriptions.active",
            initialSubscriptionsFilterAndSort(false, ["active"]),
            ["subscription_id", "description", "status", "customer", "product"],
            { showSettings: false, refresh: true, pageSize: 10 }
        );

        return (
            <div className="subscriptions-container">
                <ConfirmationDialog
                    isOpen={this.state.confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={this.state.confirmationDialogAction}
                    question={this.state.confirmationDialogQuestion}
                />
                <SubscriptionsTable
                    key={"active"}
                    initialTableSettings={activeSettings}
                    renderActions={this.renderActions}
                    isSubscription={true}
                />
                {/*<SubscriptionsTable*/}
                {/*key={"active"}*/}
                {/*initialTableSettings={activeSettings}*/}
                {/*renderActions={this.renderActions}*/}
                {/*isSubscription={true}*/}
                {/*/>*/}
                <ScrollUpButton />
            </div>
        );
    }
}

SubscriptionsPage.contextType = ApplicationContext;
