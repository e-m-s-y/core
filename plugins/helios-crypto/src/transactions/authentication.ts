import { Identities, Interfaces, Transactions, Utils } from "@solar-network/crypto";

import { TransactionType, TransactionTypeGroup } from "../enums";
import * as schemas from "./schemas";

export class AuthenticationTransaction extends Transactions.Transaction {
    public static typeGroup: number = TransactionTypeGroup.Helios;
    public static type: number = TransactionType.Authentication;
    public static key: string = schemas.authentication.$id;
    public static version: number = 2;

    protected static defaultStaticFee: Utils.BigNumber = Utils.BigNumber.ONE;

    public static getSchema(): schemas.TransactionSchema {
        return schemas.authentication;
    }

    public serialize(options?: Interfaces.ISerializeOptions): Utils.ByteBuffer {
        const buffer: Utils.ByteBuffer = new Utils.ByteBuffer(Buffer.alloc(8 + 4 + 21 + 1));

        buffer.writeBigUInt64LE(this.data.amount.toBigInt()); // 8
        buffer.writeUInt32LE(this.data.expiration || 0); // 4

        if (this.data.recipientId) {
            buffer.writeBuffer(Identities.Address.toBuffer(this.data.recipientId).addressBuffer); // 21
        }

        if (this.data.asset) {
            buffer.writeUInt8(this.data.asset.isLoggedIn ? 1 : 0); // 1
        }

        return buffer;
    }

    public deserialize(buffer: Utils.ByteBuffer): void {
        this.data.amount = Utils.BigNumber.make(buffer.readBigUInt64LE().toString());
        this.data.expiration = buffer.readUInt32LE();
        this.data.recipientId = Identities.Address.fromBuffer(buffer.readBuffer(21));
        this.data.asset = {
            isLoggedIn: !!buffer.readUInt8(),
        };
    }
}
