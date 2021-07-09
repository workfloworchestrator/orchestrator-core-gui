import React from "react";

export function SubscriptionDetailSection({
    name,
    children,
    className = "",
}: React.PropsWithChildren<{
    name: React.ReactNode;
    className?: string;
}>) {
    return (
        <section className="details">
            <h2>{name}</h2>
            <div className={className}>{children}</div>
        </section>
    );
}
