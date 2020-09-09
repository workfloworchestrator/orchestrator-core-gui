/*
 * Copyright 2019-2020 SURF.
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

import {
  EuiFlexGrid,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPanel,
  EuiTitle
} from "@elastic/eui";
import React from "react";

import ServicePortSelectorModal from "../components/modals/ServicePortSelectorModal";
import ApplicationContext from "../utils/ApplicationContext";

interface IProps {}

interface IState {}

export default class PortFilterMock extends React.PureComponent<IProps, IState> {
  render() {
    const ITEM_STYLE = { width: "800px" };
    return (
      <EuiPage>
        <EuiPageBody component="div">
          <EuiPageContent>
            <EuiPageContentHeader>
              <EuiPageContentHeaderSection>
                <EuiTitle>
                  <h2>Filter mocks (and page template test)</h2>
                </EuiTitle>
              </EuiPageContentHeaderSection>
            </EuiPageContentHeader>
            <EuiPageContentBody>
              <EuiFlexGrid>
                <EuiFlexItem style={ITEM_STYLE}>
                  <EuiPanel>
                    <ServicePortSelectorModal selectedTabId="nodeFilter" />
                  </EuiPanel>
                </EuiFlexItem>
                <EuiFlexItem style={ITEM_STYLE}>
                  <EuiPanel>
                    <ServicePortSelectorModal selectedTabId="favorites" />
                  </EuiPanel>
                </EuiFlexItem>
              </EuiFlexGrid>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}

PortFilterMock.contextType = ApplicationContext;
