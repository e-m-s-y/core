import { Interfaces, Transactions, Utils } from "@solar-network/crypto";

import { AuthenticationTransaction } from "../transactions";

export class AuthenticationBuilder extends Transactions.TransactionBuilder<AuthenticationBuilder> {
    public constructor() {
        super();

        this.data.type = AuthenticationTransaction.type;
        this.data.typeGroup = AuthenticationTransaction.typeGroup;
        this.data.fee = AuthenticationTransaction.staticFee();
        this.data.version = 2;
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.recipientId = undefined;
        this.data.senderPublicKey = undefined;
        this.data.asset = {
            isLoggedIn: undefined,
        };
    }

    public loggedIn(): AuthenticationBuilder {
        if (this.data.asset) {
            this.data.asset.isLoggedIn = true;
        }

        return this;
    }

    public loggedOut(): AuthenticationBuilder {
        if (this.data.asset) {
            this.data.asset.isLoggedIn = false;
        }

        return this;
    }

    public setLoggedIn(bool: boolean): AuthenticationBuilder {
        if (this.data.asset) {
            this.data.asset.isLoggedIn = bool;
        }

        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();

        struct.amount = this.data.amount;
        struct.recipientId = this.data.recipientId;
        struct.asset = this.data.asset;

        return struct;
    }

    protected instance(): AuthenticationBuilder {
        return this;
    }
}
