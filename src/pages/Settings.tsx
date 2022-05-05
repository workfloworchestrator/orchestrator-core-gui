/*
 * Copyright 2019-2022 SURF.
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

import "emotion/pages/Settings";

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
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import {description} from "../emotion/pages/Settings";

enum Cache {
    ims = "ims",
    crm = "crm",
    api = "api",
    all = "all",
}

interface IProps {}

export const Settings: FunctionComponent = (props: IProps) => {
    const intl = useIntl();
    const [cache, setCache] = useState<Cache>(Cache.ims);
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
        apiClient.clearCache(cache).then(() => {
            setFlash(
                intl.formatMessage(
                    { id: "settings.cache.flushed" },
                    { name: intl.formatMessage({ id: `settings.cache.name.${cache}` }) }
                )
            );
        });
    };

    const handleCacheChange = (newCache: Cache) => {
        setCache(newCache);
    };

    const getCacheOptions = () => {
        const cacheOptions = [];

        for (const cacheOption in Cache) {
            if (isNaN(Number(cacheOption))) {
                cacheOptions.push({
                    value: cacheOption,
                    text: intl.formatMessage({ id: `settings.cache.name.${cacheOption}` }),
                });
            }
        }

        return cacheOptions;
    };

    const cacheOptions = getCacheOptions();
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
                        options={cacheOptions}
                        value={cache}
                        onChange={(e) => handleCacheChange(e.target.value as Cache)}
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
                    <EuiDescriptionList css={description} type="column" listItems={engineDescription} style={{ maxWidth: "400px" }} />
                </EuiCard>
            </EuiPageBody>
        </EuiPage>
    );
};

export default Settings;
