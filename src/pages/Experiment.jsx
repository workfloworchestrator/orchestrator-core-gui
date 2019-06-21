import React from "react";
import UserInputWrapper from "../components/UserInputWrapper";

export default class Experiment extends React.Component {
    render() {
        <UserInputWrapper name="test" render={child => <GenericSelect choices={["SAP 1", "SAP 2", "SAP 3"]} />} />;
    }
}
