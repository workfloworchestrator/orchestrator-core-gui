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

import "locale/en";
import "locale/nl";

import "../../node_modules/@fortawesome/fontawesome-free/css/all.css";

import { EuiFlexItem, EuiLoadingSpinner, EuiProvider, EuiToast } from "@elastic/eui";
import * as Sentry from "@sentry/react";
import EditProduct from "components/EditProduct";
import Flash from "components/Flash";
import Header from "components/Header";
import ErrorDialog from "components/modals/ErrorDialog";
import Navigation from "components/Navigation";
import ProductBlock from "components/ProductBlock";
import ProtectedRoute from "components/ProtectedRoute";
import ViewProduct from "components/ViewProduct";
import GlobalContextProviders from "contextProviders/globalContextProviders";
import FormTest from "custom-surf/pages/FormTest";
import manifest from "custom/manifest.json";
import { ENV } from "env";
import { createBrowserHistory } from "history";
import { intl, setLocale } from "locale/i18n";
import { memoize } from "lodash";
import MetaData from "pages/MetaData";
import ModifySubscription from "pages/ModifySubscription";
import NewProcess from "pages/NewProcess";
import NewTask from "pages/NewTask";
import NotAllowed from "pages/NotAllowed";
import NotFound from "pages/NotFound";
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
import { IntlShape, RawIntlProvider } from "react-intl";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import ApplicationContext, { ApplicationContextInterface, apiClient, customApiClient } from "utils/ApplicationContext";
import { createPolicyCheck } from "utils/policy";
import { getParameterByName, getQueryParameters } from "utils/QueryParameters";
import { AppError } from "utils/types";
import { isEmpty } from "utils/Utils";

import { appStyling } from "./AppStyling";

export const history = createBrowserHistory();

interface IProps {
    user?: Partial<Oidc.Profile> & { [index: string]: any };
}

interface IState {
    loading: boolean;
    loaded: boolean;
    importedModules: any[];
    importedPlugins: any[];
    applicationContext: ApplicationContextInterface;
    error: boolean;
    errorDialogOpen: boolean;
    errorDialogAction: () => void;
    intl?: IntlShape;
}

const queryClient = new QueryClient();

class App extends React.PureComponent<IProps, IState> {
    constructor(props: IProps, context: ApplicationContextInterface) {
        super(props, context);
        this.state = {
            loading: true,
            loaded: false,
            importedModules: [],
            importedPlugins: [],
            applicationContext: {
                theme: localStorage.getItem("darkMode") || false ? "dark" : "light",
                organisations: [],
                locationCodes: [],
                assignees: [],
                processStatuses: [],
                products: [],
                redirect: (url) => history.push(url),
                setLocale: async (locale: string) => {
                    const intl = await setLocale(locale);
                    this.setState({ intl: intl });
                },
                allowed: (_resource: string) => false,
                apiClient: apiClient,
                customApiClient: customApiClient,
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
            apiClient.reportError(error).then();
        };

        history.listen(() => {
            if (!this.state.loading) {
                this.loadData();
            }
        });
    }

    importCustomPages = () => {
        if (manifest.customPages) {
            try {
                const importedModules: any[] = [];
                const importPromises = manifest.customPages.map((page, index) =>
                    // @ts-ignore
                    import(`../custom/${page.path}/${page.file}`).then((module) => {
                        // @ts-ignore
                        importedModules.push({ ...page, page_order: index, Component: module.default });
                    })
                );

                Promise.all(importPromises).then(() =>
                    this.setState((prevState) => ({
                        ...prevState,
                        importedModules,
                    }))
                );
            } catch (err: any) {
                console.error(err.toString());
            }
        }
    };

    async componentDidMount() {
        if (ENV.REVIEW_APP) {
            const script = document.createElement("script");
            script.src = "https://gitlab.com/assets/webpack/visual_review_toolbar.js";
            script.id = "review-app-toolbar-script";
            script.setAttribute("data-project-id", ENV.CI_PROJECT_ID);
            script.setAttribute("data-merge-request-id", ENV.CI_MERGE_REQUEST_IID);
            script.setAttribute("data-mr-url", ENV.GITLAB_URL);
            script.setAttribute("data-project-path", ENV.CI_PROJECT_PATH);
            script.setAttribute("data-require-auth", "true");
            script.async = true;
            document.head.appendChild(script);
        }

        await this.loadData();
        this.importCustomPages();
    }

    async loadData() {
        if (window.location.pathname.endsWith("/error") || window.location.pathname.endsWith("/not-allowed")) {
            this.setState({ loading: false, intl: intl });
            return;
        }

        if (this.state.loaded) {
            return;
        }

        const [
            allOrganisations,
            allLocationCodes,
            allProducts,
            allAssignees,
            allProcessStatuses,
            language,
            allowed,
        ] = await Promise.all([
            this.state.applicationContext.customApiClient.organisations(),
            this.state.applicationContext.customApiClient.locationCodes(),
            this.state.applicationContext.apiClient.products(),
            this.state.applicationContext.apiClient.assignees(),
            this.state.applicationContext.apiClient.processStatuses(),
            setLocale(intl.locale),
            createPolicyCheck(this.props.user),
        ]);

        const filteredProducts = (allProducts || []).sort((a: { name: string }, b: { name: any }) =>
            a.name.localeCompare(b.name)
        );

        this.setState({
            loading: false,
            loaded: true,
            intl: language,
            applicationContext: {
                theme: this.state.applicationContext.theme,
                organisations: allOrganisations || [],
                locationCodes: allLocationCodes || [],
                assignees: allAssignees || [],
                processStatuses: allProcessStatuses || [],
                products: filteredProducts || [],
                redirect: (url) => history.push(url),
                setLocale: async (locale: string) => {
                    const intl = await setLocale(locale);
                    this.setState({ intl: intl });
                },
                allowed: memoize(allowed),
                apiClient: apiClient,
                customApiClient: customApiClient,
            },
        });
    }

    render() {
        const { loading, errorDialogAction, errorDialogOpen, applicationContext, intl, importedModules } = this.state;

        if (loading || !intl) {
            return null; // render null when app is not ready yet for static mySpinner
        }
        return (
            <QueryClientProvider client={queryClient}>
                <EuiProvider colorMode={applicationContext.theme}>
                    <Router history={history}>
                        <QueryParamProvider ReactRouterRoute={Route}>
                            <ApplicationContext.Provider value={applicationContext}>
                                <RawIntlProvider value={intl}>
                                    <GlobalContextProviders>
                                        <EuiFlexItem css={appStyling}>
                                            {loading && (
                                                <EuiToast className="sync" color="primary">
                                                    <EuiLoadingSpinner size="m" />
                                                    <h6 className="sync__label">Syncing</h6>
                                                </EuiToast>
                                            )}
                                            <div>
                                                <ReactQueryDevtools initialIsOpen={false} position={"bottom-right"} />
                                                <div>
                                                    <Flash />
                                                    <Header />
                                                    <Navigation
                                                        extraPages={importedModules
                                                            .filter((i) => i.showInMenu)
                                                            .sort((a, b) => a.page_order - b.page_order) // Ensure same order as manifest
                                                            .map((i) => i.name)}
                                                    />
                                                    <ErrorDialog isOpen={errorDialogOpen} close={errorDialogAction} />
                                                </div>
                                                <Switch>
                                                    <Route exact path="/authorize" render={() => <Redirect to="/" />} />
                                                    <Route exact path="/" render={() => <Redirect to="/processes" />} />
                                                    <ProtectedRoute
                                                        path="/new-process"
                                                        render={(props) => (
                                                            <NewProcess
                                                                preselectedInput={getQueryParameters(
                                                                    props.location.search
                                                                )}
                                                            />
                                                        )}
                                                    />
                                                    <ProtectedRoute
                                                        path="/modify-subscription"
                                                        render={(props) => (
                                                            <ModifySubscription
                                                                workflowName={getParameterByName(
                                                                    "workflow",
                                                                    props.location.search
                                                                )}
                                                                subscriptionId={getParameterByName(
                                                                    "subscription",

                                                                    props.location.search
                                                                )}
                                                            />
                                                        )}
                                                    />
                                                    <ProtectedRoute
                                                        path="/terminate-subscription"
                                                        render={(props) => (
                                                            <TerminateSubscription
                                                                subscriptionId={getParameterByName(
                                                                    "subscription",

                                                                    props.location.search
                                                                )}
                                                            />
                                                        )}
                                                    />
                                                    <Route
                                                        path="/process/:id"
                                                        render={(props) => (
                                                            <Redirect to={`/processes/${props.match.params.id}`} />
                                                        )}
                                                    />
                                                    <Route
                                                        path="/processes/:id"
                                                        render={(props) => <ProcessDetail {...props} />}
                                                    />
                                                    <ProtectedRoute
                                                        path="/processes"
                                                        render={(props) => <Processes />}
                                                    />
                                                    <Route
                                                        path="/subscription/:id"
                                                        render={(props) => (
                                                            <Redirect to={`/subscriptions/${props.match.params.id}`} />
                                                        )}
                                                    />
                                                    {!manifest.disabledRoutes.includes("/subscriptions/:id") && (
                                                        <Route
                                                            path="/subscriptions/:id"
                                                            render={(props) => <SubscriptionDetailPage {...props} />}
                                                        />
                                                    )}
                                                    {!manifest.disabledRoutes.includes("/subscriptions") && (
                                                        <Route
                                                            path="/subscriptions"
                                                            render={(props) => <SubscriptionsPage {...props} />}
                                                        />
                                                    )}
                                                    {!manifest.disabledRoutes.includes("/metadata") && (
                                                        <Route
                                                            exact
                                                            path="/metadata"
                                                            render={() => <Redirect to="/metadata/products" />}
                                                        />
                                                    )}
                                                    <ProtectedRoute
                                                        path="/metadata/product-block/:id"
                                                        render={(props) => <ProductBlock {...props} />}
                                                    />
                                                    <ProtectedRoute
                                                        path="/metadata/product/edit/:id"
                                                        render={(props) => <EditProduct {...props} />}
                                                    />
                                                    <ProtectedRoute
                                                        path="/metadata/product/view/:id"
                                                        render={(props) => <ViewProduct {...props} />}
                                                    />
                                                    <ProtectedRoute
                                                        path="/metadata/:type"
                                                        render={(props) => (
                                                            <MetaData
                                                                selectedTab={props.match.params.type}
                                                                {...props}
                                                            />
                                                        )}
                                                    />
                                                    {!manifest.disabledRoutes.includes("/metadata") && (
                                                        <ProtectedRoute path="/settings" render={() => <Settings />} />
                                                    )}

                                                    {!isEmpty(importedModules) &&
                                                        importedModules
                                                            .sort((a, b) => a.page_order - b.page_order) // Ensure page-routes are matched in same order as manifest
                                                            .map(({ path, name, Component }) => (
                                                                <Route
                                                                    key={path}
                                                                    exact
                                                                    path={`/${name}`}
                                                                    component={Component}
                                                                />
                                                            ))}

                                                    <ProtectedRoute path="/new-task" render={() => <NewTask />} />

                                                    <ProtectedRoute path="/tasks" render={() => <Tasks />} />
                                                    <Route
                                                        path="/task/:id"
                                                        render={(props) => <ProcessDetail {...props} />}
                                                    />
                                                    <Route path="/not-allowed" render={() => <NotAllowed />} />
                                                    <Route
                                                        path="/error"
                                                        render={(props) => <ServerError {...props} />}
                                                    />
                                                    <Route
                                                        path="/styleguide"
                                                        render={(props) => <StyleGuide {...props} />}
                                                    />
                                                    <Route path="/form-test" render={(props) => <FormTest />} />
                                                    <Route component={NotFound} />
                                                </Switch>
                                            </div>
                                        </EuiFlexItem>
                                    </GlobalContextProviders>
                                </RawIntlProvider>
                            </ApplicationContext.Provider>
                        </QueryParamProvider>
                    </Router>
                </EuiProvider>
            </QueryClientProvider>
        );
    }
}

export default Sentry.withProfiler(App);
