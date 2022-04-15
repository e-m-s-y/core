import { Transactions as HeliosTransactions } from "@foly/helios-crypto";
import { Container, Contracts, Utils as KernelUtils } from "@solar-network/core-kernel";
import { Handlers } from "@solar-network/core-transactions";
import { Interfaces, Managers, Transactions } from "@solar-network/crypto";

import { Events } from "../events";
import { IncompleteAssetError, WalletIsAlreadyLoggedInError, WalletIsAlreadyLoggedOutError } from "./errors";
import { HeliosTransactionHandler } from "./handler";

@Container.injectable()
export class AuthenticationTransactionHandler extends HeliosTransactionHandler {
    @Container.inject(Container.Identifiers.TransactionHistoryService)
    private readonly transactionHistoryService!: Contracts.Shared.TransactionHistoryService;

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [];
    }

    public walletAttributes(): ReadonlyArray<string> {
        return ["isLoggedIn"];
    }

    public getConstructor(): Transactions.TransactionConstructor {
        return HeliosTransactions.AuthenticationTransaction;
    }

    public async bootstrap(): Promise<void> {
        const criteria = {
            typeGroup: this.getConstructor().typeGroup,
            type: this.getConstructor().type,
        };

        for await (const transaction of this.transactionHistoryService.streamByCriteria(criteria)) {
            KernelUtils.assert.defined<string>(transaction.recipientId);
            KernelUtils.assert.defined<boolean>(transaction.asset?.isLoggedIn);

            const wallet: Contracts.State.Wallet = this.walletRepository.findByAddress(transaction.recipientId);

            wallet.setAttribute("isLoggedIn", transaction.asset.isLoggedIn);

            this.walletRepository.index(wallet);
        }
    }

    public async isActivated(): Promise<boolean> {
        const milestone = Managers.configManager.getMilestone();

        return (
            typeof milestone.helios === "object" &&
            typeof milestone.helios.gameTransactions === "object" &&
            typeof milestone.helios.gameTransactions.authentication === "object" &&
            milestone.helios.gameTransactions.authentication.enabled === true
        );
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: Contracts.Kernel.EventDispatcher): void {
        KernelUtils.assert.defined<string>(transaction.data.recipientId);
        KernelUtils.assert.defined<boolean>(transaction.data.asset?.isLoggedIn);

        if (transaction.data.asset.isLoggedIn) {
            emitter.dispatch(Events.WalletLoggedIn, transaction.data);
        } else if (!transaction.data.asset.isLoggedIn) {
            emitter.dispatch(Events.WalletLoggedOut, transaction.data);
        }
    }

    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        sender: Contracts.State.Wallet,
    ): Promise<void> {
        await super.throwIfCannotBeApplied(transaction, sender);

        KernelUtils.assert.defined<any>(transaction.data.asset);

        if (typeof transaction.data.asset === "undefined") {
            throw new IncompleteAssetError();
        }

        KernelUtils.assert.defined<string>(transaction.data.recipientId);

        const recipient: Contracts.State.Wallet = this.walletRepository.findByAddress(transaction.data.recipientId);

        KernelUtils.assert.defined<boolean>(transaction.data.asset.isLoggedIn);

        if (transaction.data.asset.isLoggedIn && recipient.getAttribute("isLoggedIn", false)) {
            throw new WalletIsAlreadyLoggedInError();
        } else if (!transaction.data.asset.isLoggedIn && !recipient.getAttribute("isLoggedIn", false)) {
            throw new WalletIsAlreadyLoggedOutError();
        }
    }

    public async applyToSender(transaction) {
        await super.applyToSender(transaction);
    }

    public async revertForSender(transaction) {
        await super.revertForSender(transaction);
    }

    public async applyToRecipient(transaction: Interfaces.ITransaction): Promise<void> {
        KernelUtils.assert.defined<string>(transaction.data.recipientId);
        KernelUtils.assert.defined<boolean>(transaction.data.asset?.isLoggedIn);

        const recipient: Contracts.State.Wallet = this.walletRepository.findByAddress(transaction.data.recipientId);

        recipient.setAttribute("isLoggedIn", transaction.data.asset.isLoggedIn);

        this.walletRepository.index(recipient);
    }

    public async revertForRecipient(transaction: Interfaces.ITransaction): Promise<void> {
        KernelUtils.assert.defined<string>(transaction.data.recipientId);
        KernelUtils.assert.defined<boolean>(transaction.data.asset?.isLoggedIn);

        const recipient: Contracts.State.Wallet = this.walletRepository.findByAddress(transaction.data.recipientId);

        recipient.setAttribute("isLoggedIn", !transaction.data.asset.isLoggedIn);

        this.walletRepository.index(recipient);
    }
}
