import React from "react";
import ApplicationContext from "../utils/ApplicationContext";

export default function UserProfile() {
    return (
        <ApplicationContext.Consumer>
            {({ currentUser }) => (
                <ul className="user-profile">
                    {Object.keys(currentUser).map(key => (
                        <li key={key} className="user-attribute">
                            <span className="user-key">{key.toString()}</span>
                            <span className="value">{currentUser[key]}</span>
                        </li>
                    ))}
                </ul>
            )}
        </ApplicationContext.Consumer>
    );
}

UserProfile.propTypes = {};
