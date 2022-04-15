import { Container, Contracts } from "@solar-network/core-kernel";

import { AuthenticationTransactionHandler, CharacterRegistrationTransactionHandler } from "./handlers";
import { characterNamesIndexer } from "./wallet-indexes";

@Container.injectable()
export class Plugin {
    public static readonly ID = "@foly/helios-transactions";

    @Container.tagged("plugin", Plugin.ID)
    @Container.inject(Container.Identifiers.Application)
    private readonly app!: Contracts.Kernel.Application;

    @Container.inject(Container.Identifiers.LogService)
    private readonly log!: Contracts.Kernel.Logger;

    public async register(): Promise<void> {
        this.log.info(`[${Plugin.ID}] Registering indexers...`);
        this.registerIndexers();
        this.log.info(`[${Plugin.ID}] Indexer(s) registered.`);
        this.log.info(`[${Plugin.ID}] Registering transactions...`);
        this.app.bind(Container.Identifiers.TransactionHandler).to(AuthenticationTransactionHandler);
        this.app.bind(Container.Identifiers.TransactionHandler).to(CharacterRegistrationTransactionHandler);
        this.log.info(`[${Plugin.ID}] Transaction(s) registered.`);
    }

    private registerIndexers(): void {
        this.app
            .bind<Contracts.State.WalletIndexerIndex>(Container.Identifiers.WalletRepositoryIndexerIndex)
            .toConstantValue({ name: "characterNames", indexer: characterNamesIndexer, autoIndex: true });
    }
}
