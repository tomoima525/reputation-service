import Groups from "contract-artifacts/Groups.json"
import { Contract } from "ethers"
import { ContractName } from "src/config"

/**
 * Returns a contract instance.
 * @param contractName The name of the contract.
 * @param contractAddress The address of the contract.
 * @returns The contract instance.
 */
export default function getContractInstance(contractName: ContractName, contractAddress: string): Contract {
    switch (contractName) {
        case ContractName.GROUPS:
            return new Contract(contractAddress, Groups.abi)
        default:
            throw new TypeError(`${contractName} contract does not exist`)
    }
}
