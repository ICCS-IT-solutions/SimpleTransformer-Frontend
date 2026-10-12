/**
 * Compute precision mode for training.
 */
export enum PrecisionMode {
    /** Full FP32 compute and storage. */
    FP32 = 0,

    /** FP16 storage with FP32 compute (automatic loss scaling). */
    FP16 = 1,

    /** BF16 storage with FP32 compute (no loss scaling needed). */
    BF16 = 2,
}