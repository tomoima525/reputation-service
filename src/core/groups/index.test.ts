import { Platform } from "@interrep/reputation-criteria"
import { poseidon } from "circomlib"
import MerkleTreeController from "src/controllers/MerkleTreeController"
import seedZeroHashes from "src/utils/seeding/seedRootHashes"
import { connect, dropDatabaseAndDisconnect } from "src/utils/server/testDatabase"
import { checkGroup, getGroup, getGroupIds, getGroups } from "./index"

describe("Core group functions", () => {
    describe("Get group ids", () => {
        it("Should return all the existing group ids", () => {
            const expectedGroupIds = getGroupIds()

            expect(expectedGroupIds).toContain("TWITTER_GOLD")
            expect(expectedGroupIds).toContain("GITHUB_GOLD")
        })

        it("Should return all the group ids of an existing platform", () => {
            const expectedGroupIds = getGroupIds(Platform.TWITTER)

            expect(expectedGroupIds).toStrictEqual([
                "TWITTER_GOLD",
                "TWITTER_SILVER",
                "TWITTER_BRONZE",
                "TWITTER_NOT_SUFFICIENT"
            ])
        })
    })

    describe("Check group", () => {
        it("Should return true if a group exists", () => {
            const isAnExistingGroup = checkGroup("TWITTER_GOLD")

            expect(isAnExistingGroup).toBeTruthy()
        })

        it("Should return false if a group does not exist", () => {
            const isAnExistingGroup = checkGroup("FACEBOOK_GOLD")

            expect(isAnExistingGroup).toBeFalsy()
        })
    })

    describe("Get group", () => {
        const groupId = getGroupIds(Platform.TWITTER)[0]

        beforeAll(async () => {
            await connect()
        })

        afterAll(async () => {
            await dropDatabaseAndDisconnect()
        })

        it("Should return the correct group", async () => {
            const expectedGroup = await getGroup(groupId)

            expect(expectedGroup).toStrictEqual({ id: groupId, size: 0 })
        })

        it("Should return false if a group does not exist", async () => {
            await seedZeroHashes(false)

            for (let i = 0; i < 10; i++) {
                const idCommitment = poseidon([BigInt(i)]).toString()

                await MerkleTreeController.appendLeaf(groupId, idCommitment)
            }

            const expectedGroup = await getGroup(groupId)

            expect(expectedGroup).toStrictEqual({ id: groupId, size: 10 })
        })
    })

    describe("Get groups", () => {
        const groupId = getGroupIds(Platform.TWITTER)[0]

        beforeAll(async () => {
            await connect()
        })

        afterAll(async () => {
            await dropDatabaseAndDisconnect()
        })

        it("Should return all the existing groups", async () => {
            const expectedGroups = await getGroups()

            expect(expectedGroups).toContainEqual({ id: groupId, size: 0 })
        })
    })
})
