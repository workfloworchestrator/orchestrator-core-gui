import React from "react";
import PropTypes from "prop-types";

const attributes = ["user_name", "displayName", "email", "authenticatingAuthority", "schacHomeOrganization"]

export default function UserProfile({currentUser}) {
    return (
        <ul className="user-profile">
            {attributes.map(key =>
                <li key={key} className="user-attribute">
                    <span className="user-key">{key.toString()}</span>
                    <span className="value">{currentUser[key]}</span>
                </li>)}
        </ul>);
}

UserProfile.propTypes = {
    currentUser: PropTypes.object.isRequired
};


