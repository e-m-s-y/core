import { app, Contracts } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
import { Blockchain } from "../../blockchain";
import { BlockProcessorResult } from "../block-processor";

export abstract class BlockHandler {
    protected readonly logger: Contracts.Kernel.Log.ILogger = app.get<Contracts.Kernel.Log.ILogger>("log");

    public constructor(protected readonly blockchain: Blockchain, protected readonly block: Interfaces.IBlock) {}

    public async execute(): Promise<BlockProcessorResult> {
        this.blockchain.resetLastDownloadedBlock();

        return BlockProcessorResult.Rejected;
    }
}
