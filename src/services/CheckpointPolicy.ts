/**
 * Policy for activation checkpointing to reduce activation memory.
 */
export enum CheckpointPolicy {
    /** No checkpointing - store all activations. */
    None = 0,

    /** Checkpoint every layer - maximum memory savings, ~30% compute overhead. */
    EveryLayer = 1,

    /** Checkpoint every other layer - balanced memory/compute tradeoff. */
    EveryOtherLayer = 2,

    /** Checkpoint every N layers - configurable tradeoff. */
    EveryNLayers = 3,
}