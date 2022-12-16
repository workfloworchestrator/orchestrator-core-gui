# Changelog

All notable changes to this project will be documented in this file.
Please add a line to the unreleased section for every feature. If possible
reference the gitlab/github issue that is related to the change.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v10.6.0] - TBD

-   `#49` Listing all non-terminated subscriptions and style update in the Used_By_Subscriptions field
-   `#47` Fix subscription dropdowns to not resize when typing and fixes alignments with other input fields
-   Added description text in Owner_Subscription_Id and added a copy-to-clipboard button
-   `#41` Converted most components to a Functions based approach
-   Selecting "auto scroll" on process detail page is now stored in localstorage
-   `#44` Include subscription description of first product block relation on Subscription detail page

Surf specific:

-   Show subscription owner contacts & related customer contacts
-   Added ability to OPEN & CLOSE incident tickets with one form
-   Added a log viewer to Service ticket detail
-   Refactored Impacted objects tables to also show IMS Circuits
-   Fix CIM impacted objects without a subscription ID
-   Updated service ticket detail page to show "last_update_time"
-   Added button to restart CIM open relate step

## [v10.5.0] - 2022-10-24

-   `#42` Fix help button hidden on subscriptions page
-   `#141` Convert sass files to emotion 3
-   `#157` Redirect workflow submit to process detail
-   `#158` Add auto scrolling to last finished step in process details, a button to turn auto scrolling off or on and add fixed top menu when scrolling past actions on the page.
-   `#161` Scroll to last step in process details when page is loaded except when process is done and fix summaryfield error.
-   `#164` Update SubscriptionDetail with toggleable show related subscriptions.
-   `#166` Fix snapshot difference of standalone and SURF version. (moved to their own folder)

Surf specific:

-   `#155` cim: Check if impacted service has subscription id before calling api
-   `#156` cim: Add html parser to form summary field for email examples
-   `#170, #171, #172` Fix topology diagrams, #172 updates react-network-diagrams package.

## [v10.4.0] - 2022-08-30

-   `#134` Replace SCSS with Emotion CSS
-   `#138` Improve getting subs with inUseByIds by making the list unique
-   `#143` Allow overriding Button text, dialog and color in the FormWizard; Order custompages consistently
-   `#147` Upgrade React 17, fixes to storybook styling and mock data
-   `#149` Fix "new task" button triggering an unexpected error
-   `#150` Fix form inputs to use translation before the label
-   `#154` Fix number of failed tasks displayed by FailedTaskBanner

Surf specific:

-   `#139` cim: update impact override
-   `#142` cim: serviceticket abort
-   `#143` cim#10: serviceticket open
-   `#150` cim: remove trailing slash in api call
-   `#153` cim: hide servicetickets from menu bar

## [v10.3.0] - 2022-07-04

-   `#135` Allow user to specify label for dynamic form field

Surf specific:

-   `#130` cim#4: serviceticket details
-   `#132` cim: ticket forms and form generator

...

## [7.5.0] - unreleased

-   `#orchestrator:1044` Show subscription description on subscription detail page for resource types
-   Added react-query to easily cache double REST calls to endpoints and used it on the subscription detail page

## [7.4.0] - 2020-08-05

-   `#231` Moved LIR Prefix page to dynamically loaded route
-   `#231` Moved the SURF links on the subscription detail page to plugins
-   `#231` Moved the Network diagrams on the subscription detail page to plugins
-   `#231` Moved SURF specific GUI functionality to an own git [repo](https://git.ia.surfsara.nl/netdev/automation/projects/orchestrator-client-surf)
-   `#231` Published the GUI code to a public git [repo](https://github.com/workfloworchestrator/orchestrator-client)
-   Simplified and fixed L2VPN network diagram in the GUI
-   Improved error handling in the GUI for network diagrams when not all external resource types can be found
-   Added Grafana link for SN8 nodes on subscription detail page

## [v7.3.1]

-   Added new handling of Translations
-   added Grafana link for SN8 nodes on subscription detail page

## [7.2.0] - 2020-01-05

-   Made the client compatible with the FastAPI changes in orchestrator#740
-   Removed Validations page and api dependencies
-   `#206`: Conditionally show network diagrams for "active" and "insync" subscriptions
-   `#206`: Added a button to copy the subscription_id to your copy buffer on Subscription detail page
-   `#206`: Finished a new theme (for GPL release)
-   `#206`: Changed color of cancel buttons to be more inline with SURF theme
-   `#206`: Upgraded React-Table to 7.6.2 and EUI to 30.5.1 version
-   `#206`: Updated caniuse-lite
-   `#206`: Added EUI Panel around Subscription detail
-   `#206`: Refactored copy raw JSON from Process Detail page to EUI
-   `#206`: Removed react-copy-to-clipboard
-   `#206`: Replaced checkboxes with EuiCheckbox on Process detail page
-   `#206`: Replaced checkboxes with EuiCheckbox for Table preference
-   `#206`: Replaced all colors in HTML with values from var.scss
-   `#206`: Refactored + fixed paginator bugs for all tables
-   `#206`: Introduced mini pagination above all tables
-   `#206`: Made "notes" a default Subscription table column
-   `#206`: Main navigation/tabs are now keyboard accessible
-   Add Sentry configuration to the orchestrator client
-   Do not install node-modules in Dockerfile dev stage (do this at runtime instead)

## [7.1.2] - 2020-12-01

### Fixed

-   Fixed network diagram crashing the page for sn7 lightpath subscriptions

### Added

-   Added the Changelog file.
