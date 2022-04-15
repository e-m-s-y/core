import { Transactions as HeliosTransactions } from "@foly/helios-crypto";
import { Container, Contracts, Utils as KernelUtils } from "@solar-network/core-kernel";
import { Handlers } from "@solar-network/core-transactions";
import { Interfaces, Managers, Transactions } from "@solar-network/crypto";

import { Events } from "../events";
import {
    CharacterNameAlreadyRegisteredError,
    IncompleteAssetError,
    WalletHasCharacterRegisteredError,
    WalletIsNotLoggedInError,
} from "./errors";
import { HeliosTransactionHandler } from "./handler";
import { AuthenticationTransactionHandler } from "./index";

export class CharacterRegistrationTransactionHandler extends HeliosTransactionHandler {
    @Container.inject(Container.Identifiers.TransactionHistoryService)
    private readonly transactionHistoryService!: Contracts.Shared.TransactionHistoryService;

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [AuthenticationTransactionHandler];
    }

    public walletAttributes(): ReadonlyArray<string> {
        return ["character", "name", "classId"];
    }

    public getConstructor(): Transactions.TransactionConstructor {
        return HeliosTransactions.CharacterRegistrationTransaction;
    }

    public async bootstrap(): Promise<void> {
        const criteria = {
            typeGroup: this.getConstructor().typeGroup,
            type: this.getConstructor().type,
        };

        for await (const transaction of this.transactionHistoryService.streamByCriteria(criteria)) {
            KernelUtils.assert.defined<string>(transaction.recipientId);
            KernelUtils.assert.defined<string>(transaction.asset?.character?.name);
            KernelUtils.assert.defined<number>(transaction.asset?.character?.classId);

            const wallet: Contracts.State.Wallet = this.walletRepository.findByAddress(transaction.recipientId);

            this.walletRepository.setOnIndex("characterNames", transaction.asset.character.name, wallet);
            wallet.setAttribute("character", {
                name: transaction.asset.character.name,
                classId: transaction.asset.character.classId,
            });
            this.walletRepository.index(wallet);
        }
    }

    public async isActivated(): Promise<boolean> {
        const milestone = Managers.configManager.getMilestone();

        return (
            typeof milestone.helios === "object" &&
            typeof milestone.helios.gameTransactions === "object" &&
            typeof milestone.helios.gameTransactions.characterRegistration === "object" &&
            milestone.helios.gameTransactions.characterRegistration.enabled === true
        );
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: Contracts.Kernel.EventDispatcher): void {
        emitter.dispatch(Events.CharacterRegistered, transaction.data);
    }

    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        sender: Contracts.State.Wallet,
    ): Promise<void> {
        await super.throwIfCannotBeApplied(transaction, sender);

        KernelUtils.assert.defined<any>(transaction.data.asset);

        if (
            typeof transaction.data.asset === "undefined" ||
            typeof transaction.data.asset.character !== "object" ||
            typeof transaction.data.asset.character.name === "undefined" ||
            typeof transaction.data.asset.character.classId === "undefined"
        ) {
            throw new IncompleteAssetError();
        }

        KernelUtils.assert.defined<string>(transaction.data.recipientId);

        const recipient: Contracts.State.Wallet = this.walletRepository.findByAddress(transaction.data.recipientId);

        if (!recipient.getAttribute("isLoggedIn", false)) {
            throw new WalletIsNotLoggedInError();
        }

        if (recipient.hasAttribute("character")) {
            throw new WalletHasCharacterRegisteredError();
        }

        if (this.walletRepository.hasByIndex("characterNames", transaction.data.asset.character.name)) {
            throw new CharacterNameAlreadyRegisteredError(transaction.data.asset.character.name);
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
        KernelUtils.assert.defined<string>(transaction.data.asset?.character?.name);
        KernelUtils.assert.defined<number>(transaction.data.asset?.character?.classId);

        const recipient: Contracts.State.Wallet = this.walletRepository.findByAddress(transaction.data.recipientId);

        recipient.setAttribute("character", {
            name: transaction.data.asset.character.name,
            classId: transaction.data.asset.character.classId,
        });

        this.walletRepository.index(recipient);
    }

    public async revertForRecipient(transaction: Interfaces.ITransaction): Promise<void> {
        KernelUtils.assert.defined<string>(transaction.data.recipientId);
        KernelUtils.assert.defined<string>(transaction.data.asset?.character?.name);

        const recipient: Contracts.State.Wallet = this.walletRepository.findByAddress(transaction.data.recipientId);

        recipient.forgetAttribute("character");
        this.walletRepository.forgetOnIndex("characterNames", transaction.data.asset.character.name);
        this.walletRepository.index(recipient);
    }
}
