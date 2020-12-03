# Changelog

All notable changes to this project will be documented in this file.
Please add a line to the unreleased section for every feature. If possible
reference the gitlab/github issue that is related to the change.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

-   Made the client compatible with the FastAPI changes in orchestrator#740
-   Removed Validations page and api dependancies
-   Conditionally show network diagrams for "active" and "insync" subscriptions
-   Added a button to copy the subscription_id to your copy buffer on Subscription detail page
-   Finished a new theme (for GPL release)
-   Changed color of cancel buttons to be more inline with SURF theme
-   Upgraded React-Table to 7.6.2 and EUI to 30.5.1 version
-   Added EUI Panel around Subscription detail
-   Refactored copy raw JSON from Process Detail page to EUI and removed
-   Removed react-copy-to-clipboard and refactored copy to clipboard functionality with EUI
-   Replaced checkboxes with EuiSwitch on Process detail page

## [7.1.2] - 2020-12-01

### Fixed

-   Fixed network diagram crashing the page for sn7 lightpath subscriptions

### Added

-   Added the Changelog file.
