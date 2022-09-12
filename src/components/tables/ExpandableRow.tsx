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

import { EuiButton } from "@elastic/eui";
import { useContext, useState } from "react";
import ApplicationContext from "utils/ApplicationContext";

interface IProps {
    title: string;
    text: string;
    children: JSX.Element;
}

export const ExpandableRow = ({ title, text, children }: IProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { theme } = useContext(ApplicationContext);

    return (
        <>
            <tbody className={theme}>
                <tr>
                    <td>{title}</td>
                    <td>{text}</td>
                    <td>
                        <EuiButton
                            iconType={isExpanded ? "arrowDown" : "arrowRight"}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? "collapse" : "expand"}
                        </EuiButton>
                    </td>
                </tr>
            </tbody>
            {isExpanded && children}
        </>
    );
};
