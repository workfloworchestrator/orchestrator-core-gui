import React from "react";
import I18n from "i18n-js";
import "./NotFound.css";

export default function NotAllowed() {
    return (
        <div className="mod-not-allowed">
            <h1>{I18n.t("not_allowed.title")}</h1>
            <p dangerouslySetInnerHTML={{__html: I18n.t("not_allowed.description_html")}}/>
        </div>
    );
}