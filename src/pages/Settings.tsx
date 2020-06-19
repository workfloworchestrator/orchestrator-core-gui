/*
 * Copyright 2019-2020 SURF.
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

import "./Settings.scss";

import {
    EuiButton,
    EuiCard,
    EuiDescriptionList,
    EuiHorizontalRule,
    EuiIcon,
    EuiPage,
    EuiPageBody,
    EuiSelect,
    EuiSpacer
} from "@elastic/eui";
import I18n from "i18n-js";
import React, { SFC, useEffect, useState } from "react";

import { clearCache, getGlobalStatus, setGlobalStatus } from "../api";
import { setFlash } from "../utils/Flash";
import { EngineStatus } from "../utils/types";

enum Cache {
    ims = "ims",
    crm = "crm",
    api = "api",
    all = "all"
}

interface IProps {}

export const Settings: SFC = (props: IProps) => {
    const [cache, setCache] = useState<Cache>(Cache.ims);
    const [engineStatus, setEngineStatus] = useState<EngineStatus>();

    useEffect(() => {
        getEngineStatus();
        const interval = window.setInterval(getEngineStatus, 3000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const getEngineStatus = () => {
        getGlobalStatus().then(newEngineStatus => {
            setEngineStatus(newEngineStatus);
        });
    };

    const lockEngine = (isLocked: boolean) => {
        setGlobalStatus(isLocked).then(() => {
            setFlash(I18n.t(`settings.status.engine.${isLocked ? "pausing" : "restarted"}`));
        });
    };

    const engineDescription = [
        {
            title: I18n.t("settings.status.processes"),
            description: engineStatus?.running_processes.toString() || ""
        },
        {
            title: I18n.t("settings.status.status"),
            description: engineStatus ? (
                <>
                    <EuiIcon type="dot" color={engineStatus?.global_status === "RUNNING" ? "#33cd2e" : "#da6903"} />
                    <span>{engineStatus?.global_status.toString() || ""}</span>
                </>
            ) : (
                ""
            )
        }
    ];

    const flushCache = () => {
        clearCache(cache).then(() => {
            setFlash(
                I18n.t("settings.cache.flushed", {
                    name: I18n.t(`settings.cache.name.${cache}`)
                })
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
                    text: I18n.t(`settings.cache.name.${cacheOption}`)
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
                    title={I18n.t("settings.cache.remove")}
                    description={<span>{I18n.t("settings.cache.remove_info")}</span>}
                >
                    <EuiSelect
                        id="selectCache"
                        options={cacheOptions}
                        value={cache}
                        onChange={e => handleCacheChange(e.target.value as Cache)}
                        aria-label="Select cache to clear"
                    />
                    <EuiSpacer />
                    <EuiButton id="flush-cache" fill iconSide="right" iconType="refresh" onClick={flushCache}>
                        {I18n.t("settings.cache.clear")}
                    </EuiButton>
                </EuiCard>
                <EuiSpacer />
                <EuiCard
                    textAlign="left"
                    title={I18n.t("settings.status.info")}
                    description={<span>{I18n.t("settings.status.info_detail")}</span>}
                >
                    <EuiButton
                        id="toggle-engine-status"
                        iconType={isRunning ? "pause" : "play"}
                        fill
                        color={isRunning ? "warning" : "primary"}
                        onClick={() => lockEngine(isRunning)}
                    >
                        {I18n.t(`settings.status.options.${isRunning}`)}
                    </EuiButton>
                    <EuiHorizontalRule margin="l" />
                    <EuiDescriptionList type="column" listItems={engineDescription} style={{ maxWidth: "400px" }} />
                </EuiCard>
            </EuiPageBody>
        </EuiPage>
    );
};

export default Settings;
