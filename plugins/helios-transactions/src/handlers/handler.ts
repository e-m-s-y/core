import { Transactions as HeliosTransactions } from "@foly/helios-crypto";
import { Contracts } from "@solar-network/core-kernel";
import { Handlers } from "@solar-network/core-transactions";
import { Interfaces, Managers } from "@solar-network/crypto";

import { WalletIsNotAGameserverError } from "./errors";

export abstract class HeliosTransactionHandler extends Handlers.TransactionHandler {
    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        sender: Contracts.State.Wallet,
    ): Promise<void> {
        if (this.getConstructor() === HeliosTransactions.CharacterRegistrationTransaction) {
            const milestone = Managers.configManager.getMilestone();

            // TODO add gameserver registration transaction and use wallet attributes instead of milestones.
            if (
                typeof milestone.helios === "object" &&
                typeof milestone.helios.gameTransactions === "object" &&
                typeof milestone.helios.gameTransactions.gameservers !== "undefined" &&
                Array.isArray(milestone.helios.gameTransactions.gameservers) &&
                sender.hasAttribute("delegate") &&
                milestone.helios.gameTransactions.gameservers.includes(sender.getAttribute("delegate").username)
            ) {
                return super.throwIfCannotBeApplied(transaction, sender);
            } else {
                throw new WalletIsNotAGameserverError(sender.getAddress());
            }
        }
    }
}
