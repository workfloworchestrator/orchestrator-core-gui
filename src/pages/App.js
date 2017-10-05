import React from "react";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import "./App.css";
import ErrorDialog from "../components/ErrorDialog";
import Flash from "../components/Flash";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFound from "../pages/NotFound";
import Help from "../pages/Help";
import Processes from "../pages/Processes";
import NewProcess from "../pages/NewProcess";
import ServerError from "../pages/ServerError";
import NotAllowed from "../pages/NotAllowed";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import {config, me, organisations, products, redirectToAuthorizationServer, reportError, subscriptions} from "../api";
import "../locale/en";
import "../locale/nl";
import ProcessDetail from "./ProcessDetail";

const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

class App extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: true,
            currentUser: {},
            configuration: {},
            organisations: [],
            multiServicePoints: [],
            products: [],
            error: false,
            errorDialogOpen: false,
            errorDialogAction: () => {
                this.setState({errorDialogOpen: false});
            }
        };
        window.onerror = (msg, url, line, col, err) => {
            this.setState({errorDialogOpen: true});
            const info = err || {};
            const response = err.response || {};
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

    handleBackendDown = (err) => {
        const location = window.location;
        console.error(err);
        const alreadyRetried = location.href.indexOf("guid") > -1;
        if (alreadyRetried) {
            window.location.href = `${location.protocol}//${location.hostname}${location.port ? ":" + location.port : ""}/error`;
        } else {
            //302 redirects from Shib are cached by the browser. We force a one-time reload
            const guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
            window.location.href = `${location.href}?guid=${guid}`;
        }
    };

    componentDidMount() {
        const hash = window.location.hash;
        const accessTokenMatch = hash.match(/access_token=(.*?)&/);
        if (accessTokenMatch) {
            localStorage.setItem('access_token', accessTokenMatch[1]);
            this.fetchUser();
        } else if (window.location.href.indexOf("error") > -1) {
            this.setState({loading: false});
        } else {
            //TODO expiry date
            const accessToken = localStorage.getItem('access_token');
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

    fetchUser() {
        config()
            .catch(err => this.handleBackendDown(err))
            .then(configuration => {
                Promise.all([me(), organisations(), subscriptions("MSP"), products()]).then(result => {
                    const [currentUser, allOrganisations, multiServicePoints, allProducts] = result;
                    if (currentUser && currentUser.user_name) {
                        this.setState({
                            loading: false, currentUser: currentUser,
                            configuration: configuration, organisations: allOrganisations,
                            multiServicePoints: multiServicePoints,
                            products: allProducts
                        });
                    } else {
                        this.handleBackendDown();
                    }
                });
            });
    }

    render() {
        const {loading, errorDialogAction, errorDialogOpen} = this.state;

        if (loading) {
            return null; // render null when app is not ready yet for static spinner
        }

        const {currentUser, configuration, organisations, multiServicePoints, products} = this.state;

        return (
            <Router>
                <div>
                    <div>
                        <Flash/>
                        <Header currentUser={currentUser}/>
                        <Navigation currentUser={currentUser} {...this.props}/>
                        <ErrorDialog isOpen={errorDialogOpen}
                                     close={errorDialogAction}/>
                    </div>
                    <Switch>
                        <Route exact path="/oauth2/callback" render={() => <Redirect to="/processes"/>}/>
                        <Route exact path="/" render={() => <Redirect to="/processes"/>}/>
                        <ProtectedRoute path="/processes"
                                        currentUser={currentUser} configuration={configuration}
                                        render={props => <Processes currentUser={currentUser} {...props}
                                                                    organisations={organisations}/>}/>
                        <ProtectedRoute path="/new-process"
                                        currentUser={currentUser} configuration={configuration}
                                        render={props => <NewProcess currentUser={currentUser} products={products}
                                                                     organisations={organisations} {...props}/>}/>
                        <Route path="/process/:id"
                               render={props => <ProcessDetail currentUser={currentUser} organisations={organisations}
                                                               configuration={configuration} products={products}
                                                               multiServicePoints={multiServicePoints}
                                                               {...props}/>}/>
                        <Route path="/help"
                               render={props => <Help currentUser={currentUser} {...props}/>}/>
                        <Route path="/not-allowed"
                               render={props => <NotAllowed {...props}/>}/>
                        <Route path="/error"
                               render={props => <ServerError {...props}/>}/>
                        <Route component={NotFound}/>
                    </Switch>
                </div>
            </Router>

        );
    }
}

export default App;
