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

import "locale/en";
import "locale/nl";
import "pages/App.scss";

import { EuiLoadingSpinner, EuiToast } from "@elastic/eui";
import * as Sentry from "@sentry/react";
import Flash from "components/Flash";
import Header from "components/Header";
import ErrorDialog from "components/modals/ErrorDialog";
import Navigation from "components/Navigation";
import ProductPage from "components/Product";
import ProductBlock from "components/ProductBlock";
import ProtectedRoute from "components/ProtectedRoute";
import { createBrowserHistory } from "history";
import ModifySubscription from "pages/ModifySubscription";
import NewMetaData from "pages/NewMetaData";
import NewProcess from "pages/NewProcess";
import NewTask from "pages/NewTask";
import NotAllowed from "pages/NotAllowed";
import NotFound from "pages/NotFound";
import Prefixes from "pages/Prefixes";
import ProcessDetail from "pages/ProcessDetail";
import Processes from "pages/Processes";
import ServerError from "pages/ServerError";
import Settings from "pages/Settings";
import StyleGuide from "pages/StyleGuide";
import SubscriptionDetailPage from "pages/SubscriptionDetailPage";
import SubscriptionsPage from "pages/Subscriptions";
import Tasks from "pages/Tasks";
import TerminateSubscription from "pages/TerminateSubscription";
import React from "react";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import ApplicationContext, { ApplicationContextInterface } from "utils/ApplicationContext";
import { getParameterByName, getQueryParameters } from "utils/QueryParameters";
import { AppError } from "utils/types";

import { assignees, locationCodes, organisations, processStatuses, products, reportError } from "../api";
import FormProduct from "./FormProduct";
import FormProductBlock from "./FormProductBlock";

export const history = createBrowserHistory();

interface IState {
    loading: boolean;
    loaded: boolean;
    applicationContext: ApplicationContextInterface;
    error: boolean;
    errorDialogOpen: boolean;
    errorDialogAction: () => void;
}

class App extends React.PureComponent<{}, IState> {
    constructor(props: {}, context: ApplicationContextInterface) {
        super(props, context);
        this.state = {
            loading: true,
            loaded: false,
            applicationContext: {
                organisations: [],
                locationCodes: [],
                assignees: [],
                processStatuses: [],
                products: [],
                redirect: (url) => history.push(url),
            },
            error: false,
            errorDialogOpen: false,
            errorDialogAction: () => {
                this.setState({ errorDialogOpen: false });
            },
        };
        window.onerror = (msg, url, line, col, err?: AppError) => {
            if (err && err.response && (err.response.status === 401 || err.response.status === 403)) {
                return;
            }

            this.setState({ errorDialogOpen: true });
            const info: Partial<AppError> = err || {};
            const response: Partial<Response> = info.response || {};
            const error = {
                userAgent: navigator.userAgent,
                message: msg,
                url: url,
                line: line,
                col: col,
                error: info.message,
                stack: info.stack,
                targetUrl: response.url,
                status: response.status,
            };
            reportError(error);
        };

        history.listen(() => {
            if (!this.state.loading) {
                this.loadData();
            }
        });
    }

    async componentDidMount() {
        await this.loadData();
    }

    async loadData() {
        if (window.location.pathname.endsWith("/error") || window.location.pathname.endsWith("/not-allowed")) {
            this.setState({ loading: false });
            return;
        }

        if (this.state.loaded) {
            return;
        }

        const [allOrganisations, allProducts, allLocationCodes, allAssignees, allProcessStatuses] = await Promise.all([
            organisations(),
            products(),
            locationCodes(),
            assignees(),
            processStatuses(),
        ]);

        const filterdProducts = (allProducts || []).sort((a, b) => a.name.localeCompare(b.name));

        this.setState({
            loading: false,
            loaded: true,
            applicationContext: {
                organisations: allOrganisations || [],
                locationCodes: allLocationCodes || [],
                assignees: allAssignees || [],
                processStatuses: allProcessStatuses || [],
                products: filterdProducts || [],
                redirect: (url) => history.push(url),
            },
        });
    }

    render() {
        const { loading, errorDialogAction, errorDialogOpen, applicationContext } = this.state;

        if (loading) {
            return null; // render null when app is not ready yet for static mySpinner
        }

        return (
            <Router history={history}>
                <QueryParamProvider ReactRouterRoute={Route}>
                    <ApplicationContext.Provider value={applicationContext}>
                        {loading && (
                            <EuiToast className="sync" color="primary">
                                <EuiLoadingSpinner size="m" />
                                <h6 className="sync__label">Syncing</h6>
                            </EuiToast>
                        )}
                        <div>
                            <div>
                                <Flash />
                                <Header />
                                <Navigation />
                                <ErrorDialog isOpen={errorDialogOpen} close={errorDialogAction} />
                            </div>
                            <Switch>
                                <Route exact path="/authorize" render={() => <Redirect to="/" />} />
                                <Route exact path="/" render={() => <Redirect to="/processes" />} />
                                <ProtectedRoute
                                    path="/new-process"
                                    render={(props) => (
                                        <NewProcess preselectedInput={getQueryParameters(props.location.search)} />
                                    )}
                                />
                                <ProtectedRoute
                                    path="/modify-subscription"
                                    render={(props) => (
                                        <ModifySubscription
                                            workflowName={getParameterByName("workflow", props.location.search)}
                                            subscriptionId={getParameterByName("subscription", props.location.search)}
                                        />
                                    )}
                                />
                                <ProtectedRoute
                                    path="/terminate-subscription"
                                    render={(props) => (
                                        <TerminateSubscription
                                            subscriptionId={getParameterByName("subscription", props.location.search)}
                                        />
                                    )}
                                />
                                <Route
                                    path="/process/:id"
                                    render={(props) => <Redirect to={`/processes/${props.match.params.id}`} />}
                                />
                                <Route path="/processes/:id" render={(props) => <ProcessDetail {...props} />} />
                                <ProtectedRoute path="/processes" render={(props) => <Processes />} />
                                <Route
                                    path="/subscription/:id"
                                    render={(props) => <Redirect to={`/subscriptions/${props.match.params.id}`} />}
                                />
                                <Route
                                    path="/subscriptions/:id"
                                    render={(props) => <SubscriptionDetailPage {...props} />}
                                />
                                <Route path="/subscriptions" render={(props) => <SubscriptionsPage {...props} />} />
                                <Route exact path="/metadata" render={() => <Redirect to="/metadata/products" />} />
                                <ProtectedRoute
                                    path="/metadata/products"
                                    render={props => <NewMetaData selectedTab={"products"} {...props} />}
                                />
                                <ProtectedRoute
                                    path="/metadata/product_blocks"
                                    render={props => <NewMetaData selectedTab={"product_blocks"} {...props} />}
                                />
                                <ProtectedRoute
                                    path="/metadata/resource_types"
                                    render={props => <NewMetaData selectedTab={"resource_types"} {...props} />}
                                />
                                <ProtectedRoute
                                    path="/metadata/fixed_inputs"
                                    render={props => <NewMetaData selectedTab={"fixed_inputs"} {...props} />}
                                />
                                <ProtectedRoute
                                    path="/metadata/workflows"
                                    render={props => <NewMetaData selectedTab={"workflows"} {...props} />}
                                />
                                <ProtectedRoute
                                    path="/metadata/workflows2"
                                    render={props => <NewMetaData selectedTab={"workflows2"} {...props} />}
                                />

                                <ProtectedRoute path="/product/:id" render={props => <ProductPage {...props} />} />
                                <ProtectedRoute
                                    path="/product-block/:id"
                                    render={(props) => <ProductBlock {...props} />}
                                />
                                <ProtectedRoute path="/settings" render={() => <Settings />} />
                                <ProtectedRoute path="/prefixes" render={() => <Prefixes />} />
                                <ProtectedRoute path="/new-task" render={() => <NewTask />} />

                                <ProtectedRoute path="/tasks" render={() => <Tasks />} />
                                <Route path="/task/:id" render={(props) => <ProcessDetail {...props} />} />
                                <Route path="/not-allowed" render={() => <NotAllowed />} />
                                <Route path="/error" render={(props) => <ServerError {...props} />} />
                                <Route path="/styleguide" render={(props) => <StyleGuide {...props} />} />
                                <Route path="/test-form" render={props => <FormTestPage {...props} />} />
                                <Route component={NotFound} />
                            </Switch>
                        </div>
                    </ApplicationContext.Provider>
                </QueryParamProvider>
            </Router>
        );
    }
}

export default Sentry.withProfiler(App);
