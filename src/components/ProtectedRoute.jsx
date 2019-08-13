import React from "react";
import { Redirect, Route } from "react-router-dom";
import PropTypes from "prop-types";
import ApplicationContext from "../utils/ApplicationContext";

export default function ProtectedRoute({ path, render }) {
    /**
     * This provides the hook to restrict access based on memberships of the logged in user. For
     * now we will allow everyone access
     */

    return (
        <ApplicationContext.Consumer>
            {({ currentUser, configuration }) => {
                if (currentUser || configuration.oauthEnabled) {
                    return <Route path={path} render={render} />;
                }
                return <Redirect to={"/not-allowed"} />;
            }}
        </ApplicationContext.Consumer>
    );
}

ProtectedRoute.propTypes = {
    path: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired
};
