import { EuiTab, EuiTabs } from "@elastic/eui";
import React, { useMemo, useState } from "react";
import { TabView } from "utils/types";

interface IProps {
    name: React.ReactNode;
    id: string;
    tabs: TabView[];
    className?: string;
    fixedHeight?: boolean;
}
export function TabbedSection({ name, id, tabs, className = "", fixedHeight = false }: IProps) {
    const [selectedTab, setSelectedTab] = useState(tabs[0]);
    const tabsWithContent = useMemo(() => tabs.map((tab) => ({ ...tab })), [tabs]);

    const selectedTabContent = useMemo(() => {
        // always lookup tab content here.
        // nested tabs will retain cached content.
        const tabContent = tabsWithContent.find((obj) => obj.id === selectedTab.id)?.content;
        if (!tabContent && tabsWithContent.length > 0) {
            return tabsWithContent[0].content;
        }
        return tabContent;
    }, [tabsWithContent, selectedTab]);

    const onSelectedTabChanged = (id: string) => {
        setSelectedTab(tabs.find((obj) => obj.id === id) || tabs[0]);
    };

    const renderTabs = () => {
        return tabs.map((tab, index) => (
            <EuiTab
                key={index}
                href={tab.href}
                onClick={() => onSelectedTabChanged(tab.id)}
                isSelected={tab.id === selectedTab.id}
                disabled={tab.disabled}
            >
                {tab.name}
            </EuiTab>
        ));
    };
    return (
        <section className={`${className} tabbed-details`}>
            <EuiTabs>{renderTabs()}</EuiTabs>
            <div className="scrollable-tab-content">{selectedTabContent}</div>
        </section>
    );
}
