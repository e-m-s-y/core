import { Transactions } from "@solar-network/crypto";
import deepmerge from "deepmerge";

import { TransactionType, TransactionTypeGroup } from "../enums";

export const extend = (parent, properties): Transactions.schemas.TransactionSchema => {
    return deepmerge(parent, properties);
};

export const authentication = extend(Transactions.schemas.transactionBaseSchema, {
    $id: "authentication",
    required: ["asset", "amount", "type", "typeGroup", "recipientId"],
    properties: {
        type: {
            transactionType: TransactionType.Authentication,
        },
        typeGroup: {
            const: TransactionTypeGroup.Helios,
        },
        recipientId: { $ref: "address" },
        amount: {
            bignumber: {
                minimum: 0,
                maximum: 0,
            },
        },
        asset: {
            type: "object",
            required: ["isLoggedIn"],
            properties: {
                isLoggedIn: {
                    type: "boolean",
                },
            },
        },
    },
});

const byte = {
    type: "integer",
    minimum: 0,
    maximum: 255,
};

export const characterRegistration = extend(Transactions.schemas.transactionBaseSchema, {
    $id: "characterRegistration",
    required: ["asset", "amount", "type", "typeGroup", "recipientId"],
    properties: {
        type: {
            transactionType: TransactionType.CharacterRegistration,
        },
        typeGroup: {
            const: TransactionTypeGroup.Helios,
        },
        recipientId: { $ref: "address" },
        amount: {
            bignumber: {
                minimum: 0,
                maximum: 0,
            },
        },
        asset: {
            type: "object",
            required: ["character"],
            properties: {
                character: {
                    type: "object",
                    required: ["name", "classId"],
                    properties: {
                        name: {
                            allOf: [
                                { type: "string", pattern: "^[a-z0-9!@$&_.]+$" },
                                { minLength: 4, maxLength: 12 },
                                { transform: ["toLowerCase"] },
                            ],
                        },
                        classId: byte,
                    },
                },
            },
        },
    },
});

export type TransactionSchema = typeof Transactions.schemas.transactionBaseSchema;
