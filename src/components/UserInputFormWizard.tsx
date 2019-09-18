import React from "react";
import PropTypes from "prop-types";
import ApplicationContext from "../utils/ApplicationContext";
import UserInputForm from "./UserInputForm";
import { stop } from "../utils/Utils";
import isEqual from "lodash/isEqual";
import { catchErrorStatus } from "../api/index";

interface Form {
    form: any[];
    hasNext: boolean;
}

interface IProps {
    stepUserInput: any[];
    validSubmit: (form: {}[]) => Promise<{ response: { status: number; json: () => Promise<any> } }>;
    hasNext: boolean;
}

interface IState {
    forms: Form[];
    userInputs: {}[];
}

export default class UserInputFormWizard extends React.Component<IProps, IState> {
    static propTypes: {};
    static defaultProps: {};

    constructor(props: IProps) {
        super(props);

        this.state = { forms: [{ form: props.stepUserInput, hasNext: props.hasNext }], userInputs: [] };
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

    submit = (currentFormData: {}) => {
        const { forms, userInputs } = this.state;
        let newUserInputs = userInputs.slice(0, forms.length - 1);
        newUserInputs.push(currentFormData);

        let result = this.props.validSubmit(newUserInputs);
        return catchErrorStatus(result, 510, (json: any) => {
            this.setState({ forms: [...forms, { form: json.form, hasNext: json.hasNext }], userInputs: newUserInputs });
        });
    };

    render() {
        const { forms } = this.state;

        const currentForm = forms[forms.length - 1];

        if (!currentForm) {
            return null;
        }

        return (
            <UserInputForm
                // Generate a key based on input widget names that results in a new
                // instance of UserInputForm if the form changes
                key={currentForm.form.map(item => item.name).join()}
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
