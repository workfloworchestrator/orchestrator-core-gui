import manifest from "../custom/manifest.json";

const versionFolder = `__${manifest.name}-snapshots__/`;
/**
 *
 * @param testPath Path of the test file being tested
 * @param snapshotExtension The extension for snapshots (.snap usually)
 */
const resolveSnapshotPath = (testPath: string, snapshotExtension: string) => {
    const filePath = testPath.substring(0, testPath.lastIndexOf("/") + 1);
    const fileName = testPath.substring(testPath.lastIndexOf("/") + 1, testPath.length);

    return `${filePath}${versionFolder}${fileName}${snapshotExtension}`;
};

/**
 *
 * @param snapshotFilePath The filename of the snapshot (i.e. some.test.js.snap)
 * @param snapshotExtension The extension for snapshots (.snap)
 */
const resolveTestPath = (snapshotFilePath: string, snapshotExtension: string) => {
    return snapshotFilePath.replace(snapshotExtension, "").replace(versionFolder, ""); //Remove the .snap
};

/* Used to validate resolveTestPath(resolveSnapshotPath( {this} )) */
const testPathForConsistencyCheck = "some.test.js";

module.exports = {
    resolveSnapshotPath,
    resolveTestPath,
    testPathForConsistencyCheck,
};
