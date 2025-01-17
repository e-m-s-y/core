import { Commands, Container, Contracts, Utils } from "@solar-network/core-cli";
import { Container as KernelContainer, Contracts as KernelContracts } from "@solar-network/core-kernel";
import { Networks } from "@solar-network/crypto";
import Joi from "joi";

/**
 * @export
 * @class Command
 * @extends {Commands.Command}
 */
@Container.injectable()
export class Command extends Commands.Command {
    /**
     * The console command signature.
     *
     * @type {string}
     * @memberof Command
     */
    public signature: string = "snapshot:dump";

    /**
     * The console command description.
     *
     * @type {string}
     * @memberof Command
     */
    public description: string = "Create a full snapshot of the database";

    /**
     * Configure the console command.
     *
     * @returns {void}
     * @memberof Command
     */
    public configure(): void {
        this.definition
            .setFlag("token", "The name of the token", Joi.string().default("solar"))
            .setFlag("network", "The name of the network", Joi.string().valid(...Object.keys(Networks)))
            .setFlag("codec", "The name of the codec", Joi.string().valid("default", "json"))
            .setFlag("skipCompression", "Skip gzip compression", Joi.boolean())
            .setFlag("start", "The start network height to export", Joi.number())
            .setFlag("end", "The end network height to export", Joi.number());
    }

    /**
     * Execute the console command.
     *
     * @returns {Promise<void>}
     * @memberof Command
     */
    public async execute(): Promise<void> {
        const flags: Contracts.AnyObject = { ...this.getFlags() };
        flags.processType = "snapshot";

        const app = await Utils.buildApplication({
            flags,
        });

        await app
            .get<KernelContracts.Snapshot.SnapshotService>(KernelContainer.Identifiers.SnapshotService)
            .dump(flags as any);

        await app.terminate();
    }
}
