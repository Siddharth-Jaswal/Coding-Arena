class StorageProvider {
    /**
     * StorageProvider abstraction for the future Judge integration.
     */

    async getAsset(problemId) {
        throw new Error('Not implemented: getAsset');
    }

    async downloadArchive(problemId) {
        throw new Error('Not implemented: downloadArchive');
    }

    async verifyCache(problemId) {
        throw new Error('Not implemented: verifyCache');
    }
}

module.exports = StorageProvider;
