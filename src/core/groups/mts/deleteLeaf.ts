import { MerkleTreeNode, MerkleTreeNodeDocument, MerkleTreeZero } from "@interrep/db"
import { ReputationLevel } from "@interrep/reputation-criteria"
import config from "src/config"
import { checkGroup } from "src/core/groups"
import { Provider } from "src/types/groups"
import { poseidon } from "src/utils/common/crypto"
import { PoapGroupName } from "../poap"

export default async function deleteLeaf(
    provider: Provider,
    name: ReputationLevel | PoapGroupName | string,
    identityCommitment: string
): Promise<string> {
    if (!checkGroup(provider, name)) {
        throw new Error(`The group ${provider} ${name} does not exist`)
    }

    let node = await MerkleTreeNode.findByGroupAndHash({ provider, name }, identityCommitment)

    if (!node) {
        throw new Error(`The identity commitment ${identityCommitment} does not exist`)
    }

    // Get the first zero hash.
    const zero = await MerkleTreeZero.findOne({ level: 0 })

    if (!zero) {
        throw new Error(`The zero hashes have not yet been created`)
    }

    node.hash = zero.hash

    await node.save()

    let currentIndex = node.index

    for (let level = 0; level < config.MERKLE_TREE_DEPTH; level++) {
        const parentNode = (await MerkleTreeNode.findByGroupAndLevelAndIndex(
            { provider, name },
            level + 1,
            Math.floor(currentIndex / 2)
        )) as MerkleTreeNodeDocument
        const siblingNode = await MerkleTreeNode.findByGroupAndLevelAndIndex(
            { provider, name },
            level,
            currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1
        )

        if (siblingNode) {
            siblingNode.siblingHash = node.hash

            await siblingNode.save()
        }

        if (currentIndex % 2 === 0) {
            parentNode.hash = poseidon(node.hash, node.siblingHash as string)
        } else {
            parentNode.hash = poseidon(node.siblingHash as string, node.hash)
        }

        await parentNode.save()

        currentIndex = Math.floor(currentIndex / 2)
        node = parentNode
    }

    return node.hash
}