/*
 * Copyright 2019-2023 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
    EuiButton,
    EuiCard,
    EuiDescriptionList,
    EuiHorizontalRule,
    EuiIcon,
    EuiPage,
    EuiPageBody,
    EuiSelect,
    EuiSpacer,
} from "@elastic/eui";
import EngineSettingsContext from "contextProviders/engineSettingsProvider";
import { FunctionComponent, useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useQuery } from "react-query";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";

import { descriptionStyle } from "./SettingsStyling";

interface CacheOption {
    value: string;
    text: string;
}

interface IProps {}

export const Settings: FunctionComponent = (props: IProps) => {
    const intl = useIntl();
    const [selectedCacheOption, setSelectedCacheOption] = useState<CacheOption | undefined>();
    const [cacheOptions, setCacheOptions] = useState<Record<string, CacheOption> | undefined>();
    const { apiClient } = useContext(ApplicationContext);
    const { engineStatus } = useContext(EngineSettingsContext);

    const lockEngine = (isLocked: boolean) => {
        apiClient.setGlobalStatus(isLocked).then(() => {
            setFlash(intl.formatMessage({ id: `settings.status.engine.${isLocked ? "pausing" : "restarted"}` }));
        });
    };

    const engineDescription = [
        {
            title: intl.formatMessage({ id: "settings.status.processes" }),
            description: engineStatus?.running_processes.toString() || "",
        },
        {
            title: intl.formatMessage({ id: "settings.status.status" }),
            description: engineStatus ? (
                <>
                    <EuiIcon type="dot" color={engineStatus?.global_status === "RUNNING" ? "success" : "warning"} />
                    <span>{engineStatus?.global_status.toString() || ""}</span>
                </>
            ) : (
                ""
            ),
        },
    ];

    const flushCache = () => {
        if (!selectedCacheOption) {
            return;
        }
        apiClient.clearCache(selectedCacheOption.value).then((count) => {
            setFlash(
                intl.formatMessage({ id: "settings.cache.flushed" }, { name: selectedCacheOption.text, count: count })
            );
        });
    };

    const handleCacheChange = (key: string) => {
        if (!cacheOptions) {
            return;
        }
        setSelectedCacheOption(cacheOptions[key]);
    };

    useQuery<Record<string, string>, Error>(["cache-names"], () => apiClient.getCacheNames(), {
        onSuccess: (data) => {
            setCacheOptions(
                Object.fromEntries(
                    Object.entries(data).map(([key, description]) => [key, { value: key, text: description }])
                )
            );
        },
    });
    const isRunning = engineStatus?.global_status === "RUNNING";

    return (
        <EuiPage>
            <EuiPageBody component="div">
                <EuiCard
                    textAlign="left"
                    title={<FormattedMessage id="settings.cache.remove" />}
                    description={
                        <span>
                            <FormattedMessage id="settings.cache.remove_info" />
                        </span>
                    }
                >
                    <EuiSelect
                        id="selectCache"
                        options={cacheOptions && Object.values(cacheOptions)}
                        value={selectedCacheOption?.value}
                        onChange={(e) => handleCacheChange(e.target.value)}
                        aria-label="Select cache to clear"
                    />
                    <EuiSpacer />
                    <EuiButton id="flush-cache" fill iconSide="right" iconType="refresh" onClick={flushCache}>
                        <FormattedMessage id="settings.cache.clear" />
                    </EuiButton>
                </EuiCard>
                <EuiSpacer />
                <EuiCard
                    textAlign="left"
                    title={<FormattedMessage id="settings.status.info" />}
                    description={
                        <span>
                            <FormattedMessage id="settings.status.info_detail" />
                        </span>
                    }
                >
                    <EuiButton
                        id="toggle-engine-status"
                        iconType={isRunning ? "pause" : "play"}
                        fill
                        color={isRunning ? "warning" : "primary"}
                        onClick={() => lockEngine(isRunning)}
                    >
                        <FormattedMessage id={`settings.status.options.${isRunning}`} />
                    </EuiButton>
                    <EuiHorizontalRule margin="l" />
                    <EuiDescriptionList
                        css={descriptionStyle}
                        type="column"
                        listItems={engineDescription}
                        style={{ maxWidth: "400px" }}
                    />
                </EuiCard>
            </EuiPageBody>
        </EuiPage>
    );
};

export default Settings;
