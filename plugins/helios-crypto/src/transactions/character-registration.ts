import { Identities, Interfaces, Transactions, Utils } from "@solar-network/crypto";

import { TransactionType, TransactionTypeGroup } from "../enums";
import * as schemas from "./schemas";

export class CharacterRegistrationTransaction extends Transactions.Transaction {
    public static typeGroup: number = TransactionTypeGroup.Helios;
    public static type: number = TransactionType.CharacterRegistration;
    public static key: string = schemas.characterRegistration.$id;
    public static version: number = 2;

    protected static defaultStaticFee: Utils.BigNumber = Utils.BigNumber.ONE;

    public static getSchema(): schemas.TransactionSchema {
        return schemas.characterRegistration;
    }

    public serialize(options?: Interfaces.ISerializeOptions): Utils.ByteBuffer {
        let nameBytes = Buffer.alloc(0);

        if (this.data.asset && this.data.asset.character) {
            nameBytes = Buffer.from(this.data.asset.character.name, "utf8");
        }

        const buffer: Utils.ByteBuffer = new Utils.ByteBuffer(Buffer.alloc(8 + 4 + 21 + 1 + nameBytes.length + 1));

        buffer.writeBigUInt64LE(this.data.amount.toBigInt()); // 8
        buffer.writeUInt32LE(this.data.expiration || 0); // 4

        if (this.data.recipientId) {
            buffer.writeBuffer(Identities.Address.toBuffer(this.data.recipientId).addressBuffer); // 21
        }

        buffer.writeUInt8(nameBytes.length); // 1
        buffer.writeBuffer(nameBytes); // nameBytes.length

        if (this.data.asset && this.data.asset.character) {
            buffer.writeUInt8(this.data.asset.character.classId); // 1
        }

        return buffer;
    }

    public deserialize(buffer: Utils.ByteBuffer): void {
        this.data.amount = Utils.BigNumber.make(buffer.readBigUInt64LE().toString());
        this.data.expiration = buffer.readUInt32LE();
        this.data.recipientId = Identities.Address.fromBuffer(buffer.readBuffer(21));
        this.data.asset = {
            character: {
                name: buffer.readBuffer(buffer.readUInt8()).toString(),
                classId: buffer.readUInt8(),
            },
        };
    }
}
