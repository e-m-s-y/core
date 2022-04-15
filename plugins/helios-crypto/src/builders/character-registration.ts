import { Interfaces, Transactions, Utils } from "@solar-network/crypto";

import { CharacterRegistrationTransaction } from "../transactions";

export class CharacterRegistrationBuilder extends Transactions.TransactionBuilder<CharacterRegistrationBuilder> {
    public constructor() {
        super();

        this.data.type = CharacterRegistrationTransaction.type;
        this.data.typeGroup = CharacterRegistrationTransaction.typeGroup;
        this.data.fee = CharacterRegistrationTransaction.staticFee();
        this.data.version = 2;
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.recipientId = undefined;
        this.data.senderPublicKey = undefined;
        this.data.asset = {
            character: {
                name: undefined,
                classId: undefined,
            },
        };
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();

        struct.amount = this.data.amount;
        struct.recipientId = this.data.recipientId;
        struct.asset = this.data.asset;

        return struct;
    }

    public name(name: string): CharacterRegistrationBuilder {
        if (this.data.asset && this.data.asset.character) {
            this.data.asset.character.name = name;
        }

        return this;
    }

    public classId(id: number): CharacterRegistrationBuilder {
        if (this.data.asset && this.data.asset.character) {
            this.data.asset.character.classId = id;
        }

        return this;
    }

    protected instance(): CharacterRegistrationBuilder {
        return this;
    }
}
