import { Interfaces } from "@solar-network/crypto";

import { WalletData, WalletDelegateAttributes } from "../state";

export interface Response<T> {
    data: T;
}

export interface DelegateWallet extends WalletData {
    delegate: WalletDelegateAttributes;
}

export interface CurrentRound {
    current: number;
    reward: string;
    timestamp: number;
    allDelegates: DelegateWallet[];
    delegates: DelegateWallet[];
    currentForger: DelegateWallet;
    nextForger: DelegateWallet;
    lastBlock: Interfaces.IBlockData;
    canForge: boolean;
}

export interface ForgingTransactions {
    transactions: string[];
    poolSize: number;
    count: number;
}

export interface Status {
    state: {
        header: {
            generatorPublicKey: string;
            timestamp: number;
        };
    };
}

export interface UnconfirmedTransactions {
    transactions: string[];
    poolSize: number;
}
