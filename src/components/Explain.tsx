/*
 * Copyright 2019-2022 SURF.
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

import { EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader, EuiText, EuiTitle } from "@elastic/eui";
import React from "react";

interface IProps {
    isVisible: boolean;
    close: () => void;
    title: string;
    children: React.ReactNode;
}

export default class Explain extends React.PureComponent<IProps> {
    private main: HTMLDivElement | null = null;

    componentDidUpdate(prevProps: IProps) {
        if (this.props.isVisible === true && prevProps.isVisible === false) {
            setTimeout(() => this.main?.focus(), 50);
        }
    }

    render() {
        const { close, isVisible, title, children } = this.props;

        let flyout;

        if (isVisible) {
            flyout = (
                <EuiFlyout onClose={() => close()} ownFocus size="l">
                    <EuiFlyoutHeader hasBorder>
                        <EuiTitle size="m">
                            <h2 id="flyoutTitle">{title}</h2>
                        </EuiTitle>
                    </EuiFlyoutHeader>
                    <EuiFlyoutBody>
                        <EuiText>{children}</EuiText>
                    </EuiFlyoutBody>
                </EuiFlyout>
            );
        }

        return <div>{flyout}</div>;
    }
}
