// tslint:disable:max-classes-per-file
import { Errors } from "@solar-network/core-transactions";

export class IncompleteAssetError extends Errors.TransactionError {
    public constructor() {
        super("Incomplete asset data.");
    }
}

export class SameNetworkError extends Errors.TransactionError {
    public constructor(walletAddress) {
        super(
            `Failed to link wallet as ${walletAddress} is on the same network, only addresses from third party chains are allowed.`,
        );
    }
}

export class WalletIsAlreadyLoggedInError extends Errors.TransactionError {
    public constructor() {
        super("This wallet is already logged in.");
    }
}

export class WalletIsAlreadyLoggedOutError extends Errors.TransactionError {
    public constructor() {
        super("This wallet is already logged out.");
    }
}

export class CharacterNameAlreadyRegisteredError extends Errors.TransactionError {
    public constructor(name) {
        super(`The character name "${name}" is already registered.`);
    }
}

export class WalletIsNotLoggedInError extends Errors.TransactionError {
    public constructor() {
        super("This wallet is not logged in.");
    }
}

export class WalletHasCharacterRegisteredError extends Errors.TransactionError {
    public constructor() {
        super("This wallet has already registered as a character.");
    }
}

export class WalletIsNotAGameserverError extends Errors.TransactionError {
    public constructor(walletAddress) {
        super(`Wallet ${walletAddress} is not a gameserver, use a different wallet address.`);
    }
}
