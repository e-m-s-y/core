import { Contracts, Utils } from "@solar-network/core-kernel";

export const characterNamesIndexer = (index: Contracts.State.WalletIndex, wallet: Contracts.State.Wallet): void => {
    if (wallet.hasAttribute("character")) {
        const character = wallet.getAttribute("character");

        Utils.assert.defined<string>(character.name);
        index.set(character.name, wallet);
    }
};
