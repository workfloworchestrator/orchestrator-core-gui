import React from "react";
import PropTypes from "prop-types";
import ApplicationContext from "../utils/ApplicationContext";
import UserInputForm from "./UserInputForm";
import { stop } from "../utils/Utils";
import isEqual from "lodash/isEqual";

interface Form {
    form: any[];
    hasNext: boolean;
}

interface IProps {
    stepUserInput: any[];
    validSubmit: (form: any[][]) => Promise<{ response: { status: number; json: () => Promise<any> } }>;
    hasNext: boolean;
}

interface IState {
    forms: Form[];
}

export default class UserInputFormWizard extends React.Component<IProps, IState> {
    static propTypes: {};
    static defaultProps: {};
    state: IState = { forms: [] };

    constructor(props: IProps) {
        super(props);

        this.state = { forms: [{ form: props.stepUserInput, hasNext: props.hasNext }] };
    }

    componentWillReceiveProps(nextProps: IProps) {
        if (!isEqual(nextProps, this.state.forms[0])) {
            this.setState({ forms: [{ form: nextProps.stepUserInput, hasNext: nextProps.hasNext }] });
        }
    }

    previous = (e: React.FormEvent<HTMLInputElement>) => {
        stop(e);
        let { forms } = this.state;

        forms.pop();

        this.setState({ forms: forms });
    };

    submit = (currentForm: any[]) => {
        const { forms } = this.state;
        let result = this.props.validSubmit(forms.map(f => f.form));
        result.catch(err => {
            if (err.response && err.response.status === 510) {
                err.response.json().then((json: any) => {
                    this.setState({ forms: [...forms, { form: json.form, hasNext: json.hasNext }] });
                });
            } else {
                throw err;
            }
        });
        return result;
    };

    render() {
        const { forms } = this.state;

        const currentForm = forms[forms.length - 1];

        if (!currentForm) {
            return null;
        }

        return (
            <UserInputForm
                stepUserInput={currentForm.form}
                validSubmit={this.submit}
                previous={this.previous}
                hasNext={currentForm.hasNext}
                hasPrev={forms.length > 1}
            />
        );
    }
}

UserInputFormWizard.propTypes = {
    stepUserInput: PropTypes.array.isRequired,
    validSubmit: PropTypes.func.isRequired,
    hasNext: PropTypes.bool
};

UserInputFormWizard.defaultProps = {
    hasNext: false
};

UserInputFormWizard.contextType = ApplicationContext;
