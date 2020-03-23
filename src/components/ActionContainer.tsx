import React, { useState } from "react";
import "./ActionContainer.scss";

function ActionContainer({
    title,
    renderButtonContent,
    renderContent
}: {
    title: string;
    renderButtonContent: (active: boolean) => React.ReactNode;
    renderContent: (disabled: boolean) => React.ReactNode;
}) {
    const [active, setActive] = useState(false);
    return (
        <div className={"action-container"}>
            <button
                className={"action-button"}
                onClick={e => {
                    e.stopPropagation();
                    if (active) {
                        setActive(false);
                    } else {
                        setActive(true);
                    }
                }}
            >
                {renderButtonContent(active)}
            </button>
            <div
                className={active ? "action-dialog open" : "action-dialog"}
                onClick={e => {
                    e.stopPropagation();
                    if (!active) {
                        setActive(true);
                    }
                }}
            >
                {active && renderContent(!active)}
            </div>
        </div>
    );
}

export default ActionContainer;
