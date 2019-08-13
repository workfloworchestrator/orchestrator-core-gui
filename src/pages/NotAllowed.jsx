import React from "react";
import I18n from "i18n-js";
import "./NotFound.scss";

export default function NotAllowed() {
    return (
        <div className="mod-not-allowed">
            <h1>{I18n.t("not_allowed.title")}</h1>
            <p>{I18n.t("not_allowed.description")}</p>
        </div>
    );
}
