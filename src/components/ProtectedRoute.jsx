import React from "react";
import { Redirect, Route } from "react-router-dom";
import PropTypes from "prop-types";

export default function ProtectedRoute({ path, currentUser, configuration, render }) {
    /**
     * This provides the hook to restrict access based on memberships of the logged in user. For
     * now we will allow everyone access
     */
    if (currentUser || configuration.oauthEnabled) {
        return <Route path={path} render={render} />;
    }
    return <Redirect to={"/not-allowed"} />;
}

ProtectedRoute.propTypes = {
    path: PropTypes.string.isRequired,
    currentUser: PropTypes.object.isRequired,
    configuration: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired
};
