import { EuiButton, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle } from "@elastic/eui";
import React, { useState } from "react";

type ModalInterface = {
    title: string;
    buttonTitle: string;
    children: React.ReactNode;
};

const ProcessTableModal = ({ title = "", buttonTitle = "Show Modal", children }: ModalInterface) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const closeModal = () => setIsModalVisible(false);
    const showModal = () => setIsModalVisible(true);

    let modal;

    if (isModalVisible) {
        modal = (
            <EuiModal onClose={closeModal}>
                <EuiModalHeader>
                    <EuiModalHeaderTitle>{title}</EuiModalHeaderTitle>
                </EuiModalHeader>

                <EuiModalBody>{children}</EuiModalBody>

                <EuiModalFooter>
                    <EuiButton onClick={closeModal} fill>
                        Close
                    </EuiButton>
                </EuiModalFooter>
            </EuiModal>
        );
    }

    return (
        <div>
            <EuiButton onClick={showModal}>{buttonTitle}</EuiButton>
            {modal}
        </div>
    );
};

export default ProcessTableModal;
