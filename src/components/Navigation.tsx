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

import "components/Navigation.scss";

import {
    EuiButton,
    EuiControlBar,
    EuiLoadingSpinner,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiOverlayMask,
    EuiToast
} from "@elastic/eui";
import { Control } from "@elastic/eui/src/components/control_bar/control_bar";
import I18n from "i18n-js";
import mySpinner from "lib/Spin";
import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";
import { Spinner } from "spin.js";

import FavoritesManagementModal from "./modals/FavoritesManagementModal";

const Navigation = () => {
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const history = useHistory();
    const spinnerTarget = useRef();
    const spinnerElement = useRef<Spinner>();
    const navItems = ["processes", "subscriptions", "metadata", "validations", "tasks", "prefixes", "settings"];
    const [isModalVisible, setIsModalVisible] = useState(false);
    const closeModal = () => setIsModalVisible(false);
    const showModal = () => setIsModalVisible(true);

    useEffect(() => {
        mySpinner.onStart = () => setLoading(true);
        mySpinner.onStop = () => setLoading(false);
    }, []);

    useEffect(() => {
        if (loading) {
            if (!spinnerElement.current) {
                spinnerElement.current = new Spinner({
                    lines: 25, // The number of lines to draw
                    length: 12, // The length of each line
                    width: 2, // The line thickness
                    radius: 8, // The radius of the inner circle
                    color: "#4DB3CF", // #rgb or #rrggbb or array of colors
                    top: "25%",
                    position: "fixed"
                }).spin(spinnerTarget.current);
            }
        } else {
            spinnerElement.current = undefined;
        }
    });

    const navs: any = {};

    const getControls = (): Control[] => {
        const controls: Control[] = [];

        navItems.forEach(navItem => {
            navs[navItem] = () => history.push(`/${navItem}`);
            controls.push({
                "aria-label": `${navItem}-tab`,
                controlType: "tab",
                id: `main-navigation-${navItem}-tab`,
                onClick: navs[navItem],
                label: I18n.t(`navigation.${navItem}`),
                className: location.pathname.startsWith(`/${navItem.replace("_", "-")}`)
                    ? "navigation__active navigation__item"
                    : "navigation__item"
            });
        });

        controls.push({
            "aria-label": "manage filters",
            id: "main-navigation-filters-tab",
            controlType: "icon",
            iconType: "filter",
            onClick: showModal
        });

        return [
            ...controls,
            {
                controlType: "spacer"
            },
            {
                controlType: "text",
                id: "main-navigation-new-process-tab",
                text: (
                    <Link to="/new-process">
                        <EuiButton
                            aria-label="create process"
                            id="main-navigation-new-process-tab-button"
                            iconType="plusInCircle"
                            size="s"
                            color="secondary"
                            fill
                        >
                            {I18n.t(`navigation.new_process`)}
                        </EuiButton>
                    </Link>
                ),
                className: "navigation__cta"
            }
        ];
    };

    return (
        <>
            <EuiControlBar aria-label="navigationbar" controls={getControls()} position="relative" showOnMobile />
            {loading && (
                <EuiToast className="sync" color="primary">
                    <EuiLoadingSpinner size="m" />
                    <h6 className="sync__label">Syncing</h6>
                </EuiToast>
            )}
            {isModalVisible && (
                <EuiOverlayMask>
                    <EuiModal onClose={closeModal} initialFocus="[id=modalNodeSelector]">
                        <EuiModalHeader>{I18n.t(`favorites.manage`)}</EuiModalHeader>
                        <EuiModalBody>
                            <FavoritesManagementModal />
                        </EuiModalBody>
                        <EuiModalFooter></EuiModalFooter>
                    </EuiModal>
                </EuiOverlayMask>
            )}
        </>
    );
};
export default Navigation;
