"""See README.md"""
import json
import os
import pathlib
import sys
import uuid

DATA_ROOT = pathlib.Path(os.path.abspath(__file__)).parent
assert DATA_ROOT.name == "data", "Please make sure this script is inside the data folder"


def save_orchestrator_response(url, jsonresponse, dryrun):
    """Given a URL and JSON response create/update the corresponding mockfile."""
    endpoint = url.split("/api/")[1].rstrip("/")
    try:
        path, identifier = endpoint.rsplit("/", maxsplit=1)
    except ValueError:
        path, identifier = None, endpoint

    if any(char in identifier for char in "?&="):
        # Skip urls with query parameters for now (can be normalized if it's needed)
        print(f"Unsupported URL parameters: {url}")
        return

    def get_id(string):
        """Defines how final URL component can be used as identifier"""
        try:
            parsed = uuid.UUID(string)
            return str(parsed)[:8]
        except ValueError:
            if string.isnumeric():
                return string
        return None

    try:
        response = json.loads(jsonresponse)
    except json.JSONDecodeError as e:
        print(f"Invalid JSON response: {url} ({e})")
        return

    if (parsed_id := get_id(identifier)) is None:
        # URL ends on a word "products" or "organisations"
        filename = f"{identifier}.json"
    else:
        # URL ends on UUID or integer
        if "/domain-model/" in url:
            filename_prefix = "".join(c for c in response["product"]["tag"].lower() if c.isalpha())
        else:
            filename_prefix = ""
        filename = f"{filename_prefix}-{parsed_id}.json" if filename_prefix else f"{parsed_id}.json"

    if not path:
        # Store in data/
        fpath = DATA_ROOT / filename
        print(
            f"{endpoint} -> {'update (if changed)' if fpath.is_file() else 'create'} '{filename}' in root directory"
        )
    else:
        # Store in data/<subfolder>/
        dpath = DATA_ROOT / path
        fpath = dpath / filename
        print(
            f"{endpoint} -> {'update (if changed)' if fpath.is_file() else 'create'} '{filename}' "
            f"in {'new' if not dpath.is_dir() else 'existing'} directory '{path}'"
        )
        if not dpath.is_dir() and not dryrun:
            dpath.mkdir(parents=True)

    if not dryrun:
        with fpath.open(mode="w") as handle:
            json.dump(response, handle, sort_keys=True, indent=4)


def process_har_entries(har_entries, dryrun):
    """Filter and process each successful and unique orchestrator API request"""
    # Keep successful API requests
    valid_entries = [
        entry
        for entry in har_entries
        if "/api/" in entry["request"]["url"]
        and entry["request"]["method"] == "GET"
        and 200 <= entry["response"]["status"] < 300
        and "application/json" in entry["response"]["content"]["mimeType"]
    ]

    # Filter duplicates
    unique_requests = {}
    for entry in valid_entries:
        url = entry["request"]["url"]
        json_response = entry["response"]["content"]["text"]
        if url not in unique_requests:
            unique_requests[url] = json_response
        else:
            assert (
                unique_requests[url] == json_response
            ), f"Request for {url=} occurs twice with different JSON response"

    print(f"Going to process {len(unique_requests)}/{len(har_entries)} requests")
    if dryrun:
        print("--> Dryrun mode, not making changes. Provide second parameter 'update' to create/update the mocks")
    for url in sorted(unique_requests.keys()):
        save_orchestrator_response(url, unique_requests[url], dryrun)
    if dryrun:
        print("--> Dryrun mode, not making changes. Provide second parameter 'update' to create/update the mocks")


def process_har():
    """Extract entries from a HAR file and process them."""
    try:
        filename = sys.argv[1]
        dryrun = (sys.argv[2] != "update") if len(sys.argv) > 2 else True
        with open(filename) as f:
            har = json.load(f)
    except (IndexError, FileNotFoundError):
        print("Please provide a .har file as first parameter")
    except json.JSONDecodeError as e:
        print(f"{filename} is not valid json:", e)
    else:
        process_har_entries(har["log"]["entries"], dryrun)


if __name__ == "__main__":
    process_har()
