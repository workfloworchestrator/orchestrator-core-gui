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
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css";

export class HighlightCode extends React.PureComponent {
    componentDidMount() {
        this.highlightCode();
    }

    componentDidUpdate() {
        this.highlightCode();
    }

    highlightCode() {
        const { className, languages } = this.props;

        if (languages.length === 0 && className) {
            languages.push(className);
        }

        languages.forEach(lang => {
            hljs.registerLanguage(lang, require("highlight.js/lib/languages/" + lang));
        });

        hljs.highlightBlock(this.node);
    }

    render() {
        const { data, className } = this.props;
        return (
            <pre ref={node => (this.node = node)}>
                <code className={className}>{data}</code>
            </pre>
        );
    }
}

HighlightCode.defaultProps = {
    className: "",
    languages: []
};

export default HighlightCode;
