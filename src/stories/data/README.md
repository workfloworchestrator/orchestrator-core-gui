# Directory Layout

Files contain mocked JSON responses for GET requests.

-   Directories in this folder correlate to the path in the URL (`/api/` part is stripped)
-   Filenames correspond to final path of the URL, keeping the first 8 characters for UUIDs.
-   Filenames are prefixed with a very short description of the content

**Examples**

-   The response of https://orchestrator.dev.automation.surf.net/api/processes/process-subscriptions-by-subscription-id/9296e2c4-1899-4a0e-be94-934bd859d7dc is stored in `./processes/process-subscriptions-by-subscription-id/ipbgp-9296e2c4.json`
-   The response of https://orchestrator.dev.automation.surf.net/api/subscriptions/domain-model/1e7b202f-dbe2-47fd-b07b-aa4c98c3d578 is stored in `./subscriptions/domain-model/ipprefix-1e7b202f.json`
-   The response of https://orchestrator.dev.automation.surf.net/api/surf/crm/location_codes is stored in `./surf/crm/location_codes.json`

## Deprecated endpoints

Endpoints that are deprecated because they have been renamed:

-   `subscriptions/parent_subscriptions/` is a symbolic link to `subscriptions/in_use_by/`
-   `subscriptions/child_subscriptions/` is a symbolic link to `subscriptions/depends_on/`

## Updating from HAR

The python script `parse_har.py` (python 3.8+, no dependencies) can be used to create/update JSON mocks from a HAR file. The procedure for this is as follows:

-   Open Firefox, "Networking" tab in the dev console
-   Visit a subscription detail page (i.e. https://orchestrator.dev.automation.surf.net/subscriptions/9296e2c4-1899-4a0e-be94-934bd859d7dc)
-   Right-click on one of the captured requests and click 'Save All as HAR'. For example, I temporarily store it in the current directory as `subscription_detail_requests.json`
-   Run `python3 parse_har.py subscription_detail_requests.json` to see the actions it will take. If these are as expected:
-   Run `python3 parse_har.py subscription_detail_requests.json update` to disable dryrun mode

This script was designed for the subscription detail page but it _should_ work for other pages as well.

The output can be used to see which mocks need to be imported in a Story.
