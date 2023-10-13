import { EuiPageHeader } from "@elastic/eui";
import Explain from "components/Explain";
import { ReactNode, useState } from "react";

interface IProps {
    title: ReactNode;
    explainTitle: string;
    explainDescription: ReactNode;
}

export default function FormHeader({ title, explainTitle, explainDescription }: IProps) {
    const [showExplanation, setShowExplanation] = useState(false);

    return (
        <>
            <EuiPageHeader
                pageTitle={title}
                rightSideItems={[
                    <section className="explain">
                        <i className="fa fa-question-circle" onClick={() => setShowExplanation(true)} />
                    </section>,
                ]}
            />
            <Explain close={() => setShowExplanation(false)} isVisible={showExplanation} title={explainTitle}>
                {explainDescription}
            </Explain>
        </>
    );
}
