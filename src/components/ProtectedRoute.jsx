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
