This folder contains a manifest file that holds the metainfo about the available modules and components in the custom
package.

An examples that show some included

```JS
{
    "name": "SURF",
    "customPages": [
        {
            "name": "prefixes",
            "path": "pages",
            "file": "Prefixes",
            "component": "Prefixes",
            "showInMenu": true
        },
        {
            "name": "tickets",
            "path": "pages",
            "file": "ServiceTickets",
            "component": "ServiceTickets",
            "showInMenu": true
        },
        {
            "name": "tickets/create",
            "path": "pages",
            "file": "CreateServiceTicket",
            "component": "CreateServiceTicket",
            "showInMenu": false
        }
    ],
    "disabledRoutes": ["/YOUR_DISABLED_ROUTE_HERE"],
    "disabledMenuItems": [],
    "plugins": {
        "subscriptionDetailPlugins": ["RenderDiagram", "RenderExternalLinks", "RenderDienstafname"]
    }
}
```

        {
            "name": "prefixes",
            "path": "pages",
            "file": "Prefixes",
            "component": "Prefixes",
            "showInMenu": true
        },
