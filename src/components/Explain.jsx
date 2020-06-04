import "./Explain.scss";

import PropTypes from "prop-types";
import React from "react";

export default class Explain extends React.PureComponent {
    componentWillReceiveProps(nextProps) {
        if (this.props.isVisible === false && nextProps.isVisible === true) {
            setTimeout(() => this.main.focus(), 50);
        }
    }

    render() {
        const { close, isVisible, render, title } = this.props;
        const className = isVisible ? "" : "hide";

        return (
            <div className={`explain-container ${className}`} onBlur={close} ref={ref => (this.main = ref)}>
                <section className="container">
                    <section className="title">
                        <p>{title}</p>
                        <button type="submit" id="close-explain-container" className="close" onClick={close}>
                            <i className="fa fa-times" />
                        </button>
                    </section>
                    <section className="details">{render()}</section>
                </section>
            </div>
        );
    }
}

Explain.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired
};
