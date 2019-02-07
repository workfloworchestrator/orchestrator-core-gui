import React from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'

export class HighlightCode extends React.PureComponent {

    componentDidMount(){
        this.highlightCode();
    }

    componentDidUpdate() {
        this.highlightCode();
    }

    highlightCode() {
        const {className, languages} = this.props;

        if ((languages.length === 0) && className) {
            languages.push(className);
        }

        languages.forEach(lang => {
            hljs.registerLanguage(lang, require('highlight.js/lib/languages/' + lang));
        });

        hljs.highlightBlock(this.node)
    }

    render() {
        const { data, className } = this.props;
        return (
            <pre ref={(node) => this.node = node}>
                <code className={className}>
                    {data}
                </code>
            </pre>
        )
    }
}


HighlightCode.defaultProps = {
    className: '',
    languages: [],
};

export default HighlightCode
