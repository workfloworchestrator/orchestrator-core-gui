import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import CheckBox from "./CheckBox";
import "./GenericNOCConfirm.scss";

interface IProps {
    name: string;
    data: any[][];
    onChange: (skip_workflow: boolean, value: boolean) => any;
}

interface IState {
    checks: { [key: number]: boolean };
    skip_workflow: boolean;
}

export default class GenericNOCConfirm extends React.PureComponent<IProps, IState> {
    static propTypes: {};
    readonly state: IState = { checks: {}, skip_workflow: false };

    onChangeSkip = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        let skip_workflow = target.checked;
        //after (un)skip always uncheck all checkboxes
        this.props.onChange(!skip_workflow, skip_workflow);
        this.setState({skip_workflow:  skip_workflow, checks: {}});
    }


    onChangeInternal = (index: number) => {
        return (e: React.FormEvent<HTMLInputElement>) => {
            const { checks } = this.state;
            let { data } = this.props;
            if (!data) {
                // Legacy mode
                data = [["", "checkbox"]];
            }

            const target = e.target as HTMLInputElement;

            checks[index] = target.checked;

            // We intentionally skip optional checkboxes here
            const allValid = data
                .map((entry: string[], index: number) => [entry, checks[index] || false])
                .filter((entry: (boolean | string[])[]) =>
                    (entry[0] as string[])[1].endsWith("checkbox")
                )
                .map((entry: (boolean | string[])[]) => entry[1] as boolean)
                .every((check: boolean) => check);
            this.props.onChange(allValid, allValid);

            this.setState({ checks: checks });
        };
    };

    renderCheck(index: number, name: string, type: string, i18n_params: { [key: string]: any }) {
        const { checks, skip_workflow } = this.state;

        const label = I18n.t(`process.accept.${name}`, i18n_params);

        switch (type) {
            case "label":
                return (
                    <div key={index}>
                        <label>{label}</label>
                    </div>
                );
            case "info":
                return (
                    <div key={index}>
                        <em>{label}</em>
                    </div>
                );
            case "url":
                return (
                    <div key={index}>
                        <a href={name} target="_blank" rel="noopener noreferrer">
                            {name}
                        </a>
                    </div>
                );
            case "warning":
                return (
                    <div key={index}>
                        <label className="warning">{label}</label>
                    </div>
                );
            case "skip":
                return (
                    <CheckBox
                        key={index}
                        name={name} // Index needed to allow checkboxes with same name

                        onChange={this.onChangeSkip}
                        value={skip_workflow}
                        info={label}
                        className={"skip"}
                    />
                );
            default:
                return (
                    <CheckBox
                        key={index}
                        name={name + index} // Index needed to allow checkboxes with same name
                        className={type.startsWith(">") ? "level_2" : undefined}
                        onChange={this.onChangeInternal(index)}
                        value={checks[index]}
                        info={label}
                        readOnly={skip_workflow}
                        ref={name + index}
                    />
                );
        }
    }

    render() {
        const { checks } = this.state;
        const { name, data } = this.props;

        if (!data) {
            return (
                <>
                    <label>{I18n.t(`process.${name}`)}</label>
                    <em>{I18n.t(`process.${name}_info`)}</em>
                    <CheckBox
                        name={name}
                        value={checks[0]}
                        onChange={this.onChangeInternal(0)}
                        info={I18n.t(`process.${name}`)}
                    />
                </>
            );
        } else {
            return (
                <section>
                    {data.map((entry: any[], index: number) =>
                        this.renderCheck(index, entry[0], entry[1], entry[2])
                    )}
                </section>
            );
        }
    }
}

GenericNOCConfirm.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.array
};
