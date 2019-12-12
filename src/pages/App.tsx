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
import { Redirect, Route, Switch, Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import { QueryParamProvider } from "use-query-params";

import ErrorDialog from "../components/ErrorDialog";
import Flash from "../components/Flash";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFound from "./NotFound";
import Help from "./Help";
import Processes from "./Processes";
import Subscriptions from "./Subscriptions";
import Validations from "./Validations";
import NewProcess from "./NewProcess";
import ProcessDetail from "./ProcessDetail";
import SubscriptionDetail from "./SubscriptionDetail";
import ServerError from "./ServerError";
import NotAllowed from "./NotAllowed";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import {
    config,
    locationCodes,
    logUserInfo,
    me,
    organisations,
    products,
    redirectToAuthorizationServer,
    reportError
} from "../api";
import "../locale/en";
import "../locale/nl";
import { getParameterByName, getQueryParameters } from "../utils/QueryParameters";
import TerminateSubscription from "./TerminateSubscription";
import MetaData from "./MetaData";
import ProductBlock from "../components/ProductBlock";
import ProductPage from "../components/Product";
import Cache from "./Cache";
import Tasks from "./Tasks";
import NewTask from "./NewTask";
import Prefixes from "./Prefixes";
import ApplicationContext, { ApplicationContextInterface } from "../utils/ApplicationContext";
import { Product, AppError } from "../utils/types";

import "./App.scss";

const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

const history = createBrowserHistory();

interface IState {
    loading: boolean;
    applicationContext: ApplicationContextInterface;
    error: boolean;
    errorDialogOpen: boolean;
    redirectState: string;
    errorDialogAction: () => void;
}

class App extends React.PureComponent<{}, IState> {
    constructor(props: {}, context: ApplicationContextInterface) {
        super(props, context);
        this.state = {
            loading: true,
            applicationContext: {
                organisations: [],
                locationCodes: [],
                products: [],
                redirect: url => history.push(url)
            },
            error: false,
            errorDialogOpen: false,
            redirectState: "/processes",
            errorDialogAction: () => {
                this.setState({ errorDialogOpen: false });
            }
        };
        window.onerror = (msg, url, line, col, err?: AppError) => {
            if (err && err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem("access_token");
                this.componentDidMount();
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
                status: response.status
            };
            reportError(error);
        };
    }

    handleBackendDown = () => {
        const location = window.location;
        const alreadyRetried = location.href.indexOf("guid") > -1;
        if (alreadyRetried) {
            window.location.href = `${location.protocol}//${location.hostname}${
                location.port ? ":" + location.port : ""
            }/error`;
        } else {
            //302 redirects from Shib are cached by the browser. We force a one-time reload
            const guid = (
                S4() +
                S4() +
                "-" +
                S4() +
                "-4" +
                S4().substr(0, 3) +
                "-" +
                S4() +
                "-" +
                S4() +
                S4() +
                S4()
            ).toLowerCase();
            window.location.href = `${location.href}?guid=${guid}`;
        }
    };

    componentDidMount() {
        const hash = window.location.hash;
        const accessTokenMatch = hash.match(/access_token=(.*?)&/);
        if (accessTokenMatch) {
            localStorage.setItem("access_token", accessTokenMatch[1]);
            const stateMatch = hash.match(/state=(.*?)&/);
            if (stateMatch) {
                this.setState({ redirectState: atob(stateMatch[1]) });
            }
            this.fetchUser(true);
        } else if (window.location.href.indexOf("error") > -1) {
            this.setState({ loading: false });
        } else {
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) {
                config().then(conf => {
                    if (conf.oauthEnabled) {
                        redirectToAuthorizationServer();
                    } else {
                        this.fetchUser();
                    }
                });
                return;
            }
            this.fetchUser();
        }
    }

    fetchUser(log = false) {
        config()
            .catch(err => this.handleBackendDown())
            .then(configuration => {
                me()
                    .then(currentUser => {
                        if (currentUser && (currentUser.sub || currentUser.user_name)) {
                            Promise.all([organisations(), products(), locationCodes()]).then(result => {
                                const [allOrganisations, allProducts, allLocationCodes] = result;
                                this.setState({
                                    loading: false,
                                    applicationContext: {
                                        currentUser: currentUser,
                                        configuration: configuration,
                                        organisations: allOrganisations,
                                        locationCodes: allLocationCodes,
                                        products: allProducts.sort((a: Product, b: Product) =>
                                            a.name.localeCompare(b.name)
                                        ),
                                        redirect: url => history.push(url)
                                    }
                                });
                                if (log) {
                                    logUserInfo(currentUser.email, "logged in");
                                }
                            });
                        } else {
                            this.handleBackendDown();
                        }
                    })
                    .catch(err => {
                        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                            localStorage.removeItem("access_token");
                            this.componentDidMount();
                        } else {
                            throw err;
                        }
                    });
            });
    }

    render() {
        const { loading, errorDialogAction, errorDialogOpen, applicationContext, redirectState } = this.state;

        if (loading) {
            return null; // render null when app is not ready yet for static mySpinner
        }

        return (
            <Router history={history}>
                <QueryParamProvider ReactRouterRoute={Route}>
                    <ApplicationContext.Provider value={applicationContext}>
                        <div>
                            <div>
                                <Flash />
                                <Header />
                                <Navigation />
                                <ErrorDialog isOpen={errorDialogOpen} close={errorDialogAction} />
                            </div>
                            <Switch>
                                <Route exact path="/oauth2/callback" render={() => <Redirect to={redirectState} />} />
                                <Route exact path="/" render={() => <Redirect to="/processes" />} />
                                <ProtectedRoute path="/processes" render={props => <Processes highlight={getParameterByName("highlight", props.location.search)}/>} />
                                <ProtectedRoute
                                    path="/validations/:type"
                                    render={props => <Validations match={props.match} />}
                                />
                                <ProtectedRoute
                                    path="/new-process"
                                    render={props => (
                                        <NewProcess preselectedInput={getQueryParameters(props.location.search)} />
                                    )}
                                />
                                <ProtectedRoute
                                    path="/terminate-subscription"
                                    render={props => (
                                        <TerminateSubscription
                                            subscriptionId={getParameterByName("subscription", props.location.search)}
                                        />
                                    )}
                                />
                                <Route
                                    path="/process/:id"
                                    render={props => <ProcessDetail {...props} isProcess={true} />}
                                />
                                <Route path="/subscriptions" render={props => <Subscriptions {...props} />} />
                                <Route path="/subscription/:id" render={props => <SubscriptionDetail {...props} />} />
                                <ProtectedRoute
                                    path="/metadata/:type"
                                    render={props => <MetaData match={props.match} />}
                                />
                                <ProtectedRoute
                                    path="/product/:id"
                                    render={props => <ProductPage match={props.match} />}
                                />
                                <ProtectedRoute
                                    path="/product-block/:id"
                                    render={props => <ProductBlock match={props.match} />}
                                />
                                <ProtectedRoute path="/cache" render={() => <Cache />} />
                                <ProtectedRoute path="/tasks" render={() => <Tasks />} />
                                <ProtectedRoute path="/prefixes" render={() => <Prefixes />} />
                                <ProtectedRoute path="/new-task" render={() => <NewTask />} />
                                <Route
                                    path="/task/:id"
                                    render={props => <ProcessDetail {...props} isProcess={false} />}
                                />
                                <Route path="/help" render={() => <Help />} />
                                <Route path="/not-allowed" render={() => <NotAllowed />} />
                                <Route path="/error" render={() => <ServerError />} />
                                <Route component={NotFound} />
                            </Switch>
                        </div>
                    </ApplicationContext.Provider>
                </QueryParamProvider>
            </Router>
        );
    }
}

export default App;
