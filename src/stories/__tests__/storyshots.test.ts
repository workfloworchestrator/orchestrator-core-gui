/*
 * Copyright 2019-2022 SURF.
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

import initStoryshots, { Stories2SnapsConverter } from "@storybook/addon-storyshots";
import { RenderTree } from "@storybook/addon-storyshots/dist/ts3.9/frameworks/Loader";
import { act } from "react-test-renderer";

const converter = new Stories2SnapsConverter();

// Based on the the async example and the default `snapshot` function from @storybook/addon-storyshots
// Used story id as snapshot filename
function AsyncSnapshot({
    story,
    context,
    renderTree,
    done, // --> callback passed to test method when asyncJest option is true
}: {
    story: any;
    context: any;
    renderTree: RenderTree;
    done: () => void;
}): Promise<void> | void {
    const snapshotFilename = converter.getSnapshotFileName(context);

    // mount the story
    const result = renderTree(story, context, {});

    async function match(tree: any) {
        await act(async () => {
            tree.update(story.render());
            await new Promise((resolve) => setTimeout(resolve, 2000));
        });
        const updated_tree = tree.toJSON();

        if (snapshotFilename) {
            expect(updated_tree).toMatchSpecificSnapshot(snapshotFilename);
        } else {
            expect(updated_tree).toMatchSnapshot();
        }

        if (typeof updated_tree.unmount === "function") {
            tree.unmount();
        }
        done();
    }

    if (typeof result.then === "function") {
        return result.then(match);
    }

    return match(result);
}

initStoryshots({
    /* configuration options */
    asyncJest: true,
    stories2snapsConverter: converter,
    test: AsyncSnapshot,
});
