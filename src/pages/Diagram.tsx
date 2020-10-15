import { EuiPage, EuiPageBody, EuiPageContent } from "@elastic/eui";
import NetworkDiagram from "components/Diagram";
import React from "react";

export default class Diagram extends React.Component {
    render() {
        return (
            <EuiPage>
                <EuiPageBody>
                    <EuiPageContent>
                        <NetworkDiagram type="patchpanel" />
                    </EuiPageContent>
                </EuiPageBody>
            </EuiPage>
        );
    }
}
