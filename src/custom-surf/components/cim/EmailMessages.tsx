import { EuiFlexGrid, EuiFlexItem, EuiIcon, EuiPanel, EuiText, EuiToolTip } from "@elastic/eui";
import { emailMessagesStyling } from "custom/components/cim/EmailMessagesStyling";
import { Email, ServiceTicketContact } from "custom/types";
import React, { Fragment, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { WrappedComponentProps, injectIntl } from "react-intl";

interface IProps extends WrappedComponentProps {
    emails: Email[];
    showHtml: boolean;
}

const renderContact = (contact: ServiceTicketContact) => (
    <span>
        <EuiToolTip position={"top"} content={contact.email}>
            <>
                <EuiIcon type={"email"} style={{ marginTop: "-3px" }}></EuiIcon>
                &nbsp;<a href={`mailto:${contact.email}`}>{contact.name}</a>&nbsp;&nbsp;
            </>
        </EuiToolTip>
    </span>
);

const EmailMessages = ({ emails, showHtml }: IProps) => {
    const [items] = useState(emails);

    const renderMails = (emails: Email[]) => {
        return emails.map((c, index) => (
            <EuiFlexItem>
                <EuiPanel>
                    <EuiText>
                        <h4>{c.customer.customer_name}</h4>
                    </EuiText>
                    <div>To: {c.to.map((r) => renderContact(r))}</div>
                    <div>CC: {c.cc.map((r) => renderContact(r))}</div>
                    <div>BCC: {c.bcc.map((r) => renderContact(r))}</div>
                    <div>{`Language: ${c.language}`}</div>
                    {showHtml && <div className="emailMessage">{ReactHtmlParser(c.message)}</div>}
                </EuiPanel>
            </EuiFlexItem>
        ));
    };

    return (
        <Fragment>
            {items.length !== 0 && (
                <>
                    <EuiFlexGrid css={emailMessagesStyling}>{renderMails(items)}</EuiFlexGrid>
                </>
            )}
        </Fragment>
    );
};
export default injectIntl(EmailMessages);
