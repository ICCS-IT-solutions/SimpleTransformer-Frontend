import type { TransformerConfig } from "./TransformerConfig";

/**
 * Trainable-parameter estimates for a transformer architecture, mirroring the
 * layer composition built by TransformerModel.BuildModel.
 *
 * This is deliberately a client-side approximation: the backend exposes no
 * "count the parameters" endpoint and the counts are fully determined by the
 * architecture, so deriving them here keeps the config form live as the user
 * types. Every figure below is traceable to the backend constructors:
 *
 *   EmbeddingLayer(V, E)                        -> V * E   (no bias)
 *   PositionalEncodingLayer(E, S)               -> S * E   (sinusoidal, NOT trainable)
 *   lm_head   LinearLayer(E, V, useBias:false)  -> E * V
 *   MultiHeadAttention(E, H), headSize = E / H:
 *     per head  q, k, v  LinearLayer(E, headSize, useBias:true) -> E * headSize + headSize
 *     out_proj  LinearLayer(E, E, useBias:false)                -> E * E
 *   FeedForwardLayer(E, F):
 *     w1 LinearLayer(E, F, useBias:true) -> E * F + F
 *     w2 LinearLayer(F, E, useBias:true) -> F * E + E
 *   LayerNorm(E) x 2                            -> 2 * 2E
 *
 * QLoRA swaps each LinearLayer for a QLoraLinearLayer, which registers only
 * lora_A (rank * input), lora_B (output * rank) and the bias; the dense base
 * weight matrix is frozen 4-bit and never optimised.
 */

/** LoRA rank used by QLoraLinearLayer; mirrors its ctor default (rank 8, alpha 16). */
export const LORA_RANK = 8;

/** Bytes per fp32 value; all parameters and optimizer state are float32. */
const BYTES_PER_PARAMETER = 4;

/**
 * Training state per trainable parameter under AdamW (the default preset):
 * the weight, its gradient, and the two optimizer moments (m, v). SGD with
 * momentum needs one moment instead, i.e. 12 bytes/parameter.
 */
const ADAMW_STATE_BYTES_PER_PARAMETER = 4 * BYTES_PER_PARAMETER;

export type TransformerSizeMode = "raw" | "qlora";

export type TransformerSizeBreakdown = {
    mode: TransformerSizeMode;
    /** Total parameters the optimizer updates. */
    trainableParameters: number;
    /** fp32 size of the trainable parameters alone. */
    trainableBytes: number;
    /**
     * Weights + gradients + AdamW moments: what a training step actually
     * needs resident for this parameter count. Dominates the footprint.
     */
    trainingStateBytes: number;
    /** Token embedding table plus output projection. */
    embeddingParameters: number;
    /** Linear layers inside the L transformer blocks (adapters under QLoRA). */
    blockParameters: number;
    /** LayerNorm scales and shifts. Trainable in both modes. */
    normParameters: number;
    /** LoRA adapter on lm_head. QLoRA only, 0 for raw. */
    lmHeadAdapterParameters: number;
};

export type TransformerSizeEstimate = {
    /** False when the inputs are incomplete, so the UI can show a placeholder. */
    isValid: boolean;
    /** False when embeddingSize is not divisible by numHeads (the backend throws). */
    isDivisible: boolean;
    /** The LoRA rank the QLoRA figures are based on. */
    loraRank: number;
    raw: TransformerSizeBreakdown;
    qlora: TransformerSizeBreakdown;
    /**
     * Size of the sinusoidal positional buffer (S * E fp32). A plain buffer
     * rather than a parameter, so it is memory but never trained.
     */
    positionalBufferBytes: number;
    /** Frozen 4-bit base weights retained by the QLoRA path (0.5 byte/weight). */
    qloraBaseWeightBytes: number;
};

const isUsable = (value: number) =>
    Number.isFinite(value) && value > 0;

const zeroBreakdown = (mode: TransformerSizeMode): TransformerSizeBreakdown => ({
    mode,
    trainableParameters: 0,
    trainableBytes: 0,
    trainingStateBytes: 0,
    embeddingParameters: 0,
    blockParameters: 0,
    normParameters: 0,
    lmHeadAdapterParameters: 0,
});

type BreakdownParts = Omit<
    TransformerSizeBreakdown,
    "mode" | "trainableParameters" | "trainableBytes" | "trainingStateBytes"
>;

const toBreakdown = (mode: TransformerSizeMode, parts: BreakdownParts): TransformerSizeBreakdown => {
    const trainableParameters =
        parts.embeddingParameters
        + parts.blockParameters
        + parts.normParameters
        + parts.lmHeadAdapterParameters;

    return {
        mode,
        trainableParameters,
        trainableBytes: trainableParameters * BYTES_PER_PARAMETER,
        trainingStateBytes: trainableParameters * ADAMW_STATE_BYTES_PER_PARAMETER,
        ...parts,
    };
};

/**
 * Builds the raw vs QLoRA trainable-size comparison for an architecture.
 *
 * Tolerates a partially filled config (v-model.number fields transiently report
 * NaN or an empty string while typing) by returning zeroed figures with
 * isValid = false, rather than letting NaN propagate into the template.
 */
export const estimateTransformerSizes = (config: TransformerConfig): TransformerSizeEstimate => {
    const vocabSize = config?.vocabSize;
    const embeddingSize = config?.embeddingSize;
    const numLayers = config?.numLayers;
    const numHeads = config?.numHeads;
    const feedForwardSize = config?.feedForwardSize;
    const maxSequenceLength = config?.maxSequenceLength;

    const isValid =
        isUsable(vocabSize)
        && isUsable(embeddingSize)
        && isUsable(numLayers)
        && isUsable(numHeads)
        && isUsable(feedForwardSize);

    const rank = LORA_RANK;

    if (!isValid) {
        return {
            isValid: false,
            isDivisible: false,
            loraRank: rank,
            raw: zeroBreakdown("raw"),
            qlora: zeroBreakdown("qlora"),
            positionalBufferBytes: 0,
            qloraBaseWeightBytes: 0,
        };
    }

    const V = Math.floor(vocabSize);
    const E = Math.floor(embeddingSize);
    const L = Math.floor(numLayers);
    const H = Math.floor(numHeads);
    const F = Math.floor(feedForwardSize);
    const S = isUsable(maxSequenceLength) ? Math.floor(maxSequenceLength) : 0;

    const headSize = E / H;
    const isDivisible = Number.isInteger(headSize) && headSize > 0;
    const r = rank;

    // --- Per transformer block, shared between the two modes. ---
    // Two LayerNorms (attn_norm, ffn_norm), each a gamma + beta of size E.
    const normsPerLayer = 2 * 2 * E;

    // Raw: every weight is a dense fp32 trainable parameter.
    //   q, k, v across all heads = 3 * (E * headSize + headSize) * H = 3E^2 + 3E
    //   out_proj                = E * E
    const rawAttention = 3 * E * E + 3 * E + E * E;
    //   w1 = E*F + F, w2 = F*E + E
    const rawFeedForward = E * F + F + F * E + E;
    const rawPerLayer = rawAttention + rawFeedForward + normsPerLayer;

    const raw = toBreakdown("raw", {
        // token_embeddings (V*E) plus the lm_head projection (E*V, no bias).
        embeddingParameters: 2 * V * E,
        blockParameters: rawPerLayer * L,
        normParameters: 0, // already counted inside the per-layer figure
        lmHeadAdapterParameters: 0,
    });

    // QLoRA: dense base frozen at 4-bit; only adapters, biases and norms train.
    //   q, k, v = 3 * (r*E + headSize*r + headSize) * H = 3rEH + 3rE + 3E
    //   out_proj = r*E + E*r
    const qloraAttention = 3 * r * E * H + 3 * r * E + 3 * E + (r * E + E * r);
    //   w1 = r*E + F*r + F, w2 = r*F + E*r + E
    const qloraFeedForward = r * E + F * r + F + r * F + E * r + E;

    const qlora = toBreakdown("qlora", {
        // The token embedding table stays a dense, fully trainable fp32 tensor.
        embeddingParameters: V * E,
        blockParameters: (qloraAttention + qloraFeedForward) * L,
        normParameters: normsPerLayer * L,
        // lm_head is a QLoraLinearLayer too (useBias: false).
        lmHeadAdapterParameters: r * E + V * r,
    });

    // Dense weights replaced by adapters in the QLoRA path, plus lm_head.
    const frozenBaseWeights = L * (rawAttention + rawFeedForward) + E * V;

    return {
        isValid: true,
        isDivisible,
        loraRank: r,
        raw,
        qlora,
        positionalBufferBytes: S * E * BYTES_PER_PARAMETER,
        qloraBaseWeightBytes: Math.ceil(frozenBaseWeights / 2),
    };
};

/** "8.28 M (8,278,016)": a readable magnitude alongside the exact figure. */
export const formatParameterCount = (count: number): string => {
    if (!Number.isFinite(count) || count <= 0) {
        return "0";
    }

    const exact = count.toLocaleString("en-US");

    if (count < 1_000) {
        return exact;
    }

    const units: { limit: number; suffix: string }[] = [
        { limit: 1e12, suffix: " T" },
        { limit: 1e9, suffix: " B" },
        { limit: 1e6, suffix: " M" },
        { limit: 1e3, suffix: " K" },
    ];

    const unit = units.find((candidate) => count >= candidate.limit);
    if (!unit) {
        return exact;
    }

    return `${(count / unit.limit).toFixed(2)}${unit.suffix} (${exact})`;
};

/** "132.4 MB" using binary units, matching how the backend reports memory. */
export const formatBytes = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }

    const kib = 1024;
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let unitIndex = 0;

    while (value >= kib && unitIndex < units.length - 1) {
        value /= kib;
        unitIndex++;
    }

    const decimals = unitIndex === 0 || value >= 100 ? 0 : 1;

    return `${value.toFixed(decimals)} ${units[unitIndex]}`;
};
