import React from "react";
import PropTypes from "prop-types";
import "./ValidationsExplain.css";

export default class ValidationsExplain extends React.PureComponent {

    componentWillReceiveProps(nextProps) {
        if (this.props.isVisible === false && nextProps.isVisible === true) {
            setTimeout(() => this.main.focus(), 50);
        }
    }

    render() {
        const {close, isVisible} = this.props;
        const className = isVisible ? "" : "hide";
        const explanation = <p>Explanation</p>
        const details = <p>Details</p>
        const example = <p>Example</p>
        return (
            <div className={`validation-explain ${className}`}
                 tabIndex="1" onBlur={close} ref={ref => this.main = ref}>
                <section className="container">
                    <section className="title">
                        <p>Nice, put more text</p>
                        <a className="close" onClick={close}>
                            <i className="fa fa-remove"></i>
                        </a>
                    </section>
                    {explanation}
                    {details}
                    {example}
                </section>
            </div>
        );
    }
}

ValidationsExplain.propTypes = {
    close: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired
};

