// The AI Archive catalog. Hand-maintained from the models-library manifest.
// Each model: source (Hugging Face) + the open-source program + a run command.
// `mirror` is an optional permanent link (Internet Archive / magnet) once seeded.
window.AI_INTRO = {
  eyebrow: "A preservation effort",
  title: "The AI Archive",
  lead: "Frontier labs gate, rename, and quietly remove open models. This is a free, catalogued preservation of open model weights — with the open-source code to run every one. Downloads resolve to the canonical open source; where a model has been pulled upstream, a mirror preserves it. Owned by no one — fork it, mirror it, seed it.",
};
window.AI_STATS = { count: 22, size: "1.27 TB", note: "open weights preserved" };

window.AI_RUNNERS = [
  { name: "llama.cpp", what: "Run any GGUF LLM on CPU/GPU.", url: "https://github.com/ggml-org/llama.cpp" },
  { name: "Ollama", what: "One-command local LLM runner.", url: "https://ollama.com" },
  { name: "LM Studio", what: "Desktop GUI for GGUF models.", url: "https://lmstudio.ai" },
  { name: "ComfyUI", what: "Node-based runner for image models.", url: "https://github.com/comfyanonymous/ComfyUI" },
  { name: "kokoro-onnx", what: "Run the Kokoro TTS voice.", url: "https://github.com/thewh1teagle/kokoro-onnx" },
  { name: "whisper.cpp", what: "Fast local speech-to-text.", url: "https://github.com/ggml-org/whisper.cpp" },
  { name: "Transformers", what: "Run full Hugging Face models in Python.", url: "https://github.com/huggingface/transformers" },
];

window.AI_SECTIONS = [
  { key: "historical", heading: "Historical milestones", sub: "The models that marked each step of the open era — kept runnable so the history isn't lost." },
  { key: "audio", heading: "Audio & speech", sub: "Text-to-speech and speech-to-text you can run offline." },
  { key: "image", heading: "Image generation", sub: "The open image models — including ones since removed upstream." },
  { key: "llm", heading: "Local & frontier LLMs (GGUF)", sub: "Quantised to run on real hardware, from laptop-sized to the full frontier giants." },
];

function _r(name, url) { return { name: name, url: url }; }
const LLAMA = _r("llama.cpp", "https://github.com/ggml-org/llama.cpp");
const COMFY = _r("ComfyUI", "https://github.com/comfyanonymous/ComfyUI");
const TF = _r("Transformers", "https://github.com/huggingface/transformers");

window.AI_MODELS = [
  // Historical
  { id: "gpt-j-6b", name: "GPT-J-6B", cat: "historical", size: "26 GB", fmt: "HF · fp32", repo: "EleutherAI/gpt-j-6b", license: "Apache-2.0", runner: TF, cmd: "AutoModelForCausalLM.from_pretrained('gpt-j-6b')", desc: "EleutherAI's 6B (2021) — a landmark fully-open GPT-3-class model." },
  { id: "gpt-neox-20b", name: "GPT-NeoX-20B", cat: "historical", size: "77 GB", fmt: "HF · fp16", repo: "EleutherAI/gpt-neox-20b", license: "Apache-2.0", runner: TF, cmd: "AutoModelForCausalLM.from_pretrained('gpt-neox-20b')", desc: "The largest fully-open model of its day (2022)." },
  { id: "mistral-7b-v0.1", name: "Mistral-7B-v0.1", cat: "historical", size: "27 GB", fmt: "HF · bf16", repo: "mistralai/Mistral-7B-v0.1", license: "Apache-2.0", runner: TF, cmd: "AutoModelForCausalLM.from_pretrained('Mistral-7B-v0.1')", desc: "The base model that reset the price/performance frontier (2023)." },
  { id: "vicuna-13b", name: "Vicuna-13B-v1.5", cat: "historical", size: "7.3 GB", fmt: "GGUF · Q4_K_M", repo: "TheBloke/vicuna-13B-v1.5-GGUF", license: "Llama-2 community", runner: LLAMA, cmd: "llama-cli -m vicuna-13b-v1.5.Q4_K_M.gguf -p \"Hello\"", desc: "Early open chat fine-tune that proved small models could really converse." },
  { id: "mixtral-8x7b", name: "Mixtral-8x7B-Instruct", cat: "historical", size: "25 GB", fmt: "GGUF · Q4_K_M", repo: "TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF", license: "Apache-2.0", runner: LLAMA, cmd: "llama-cli -m mixtral-8x7b-instruct-v0.1.Q4_K_M.gguf -p \"Hello\"", desc: "The mixture-of-experts model that made MoE mainstream (2023)." },
  { id: "bloom-7b1", name: "BLOOM-7.1B", cat: "historical", size: "4.9 GB", fmt: "GGUF · Q4_K_M", repo: "mradermacher/bloom-7b1-GGUF", license: "BigScience RAIL", runner: LLAMA, cmd: "llama-cli -m bloom-7b1.Q4_K_M.gguf -p \"Bonjour\"", desc: "The BigScience open-science model — 46 languages, built in the open." },
  { id: "falcon-180b", name: "Falcon-180B-Chat", cat: "historical", size: "101 GB", fmt: "GGUF · Q4", repo: "TheBloke/Falcon-180B-Chat-GGUF", license: "TII Falcon-180B", runner: LLAMA, cmd: "llama-cli -m falcon-180b-chat.Q4_K_M.gguf -p \"Hello\"", desc: "For a moment, the largest openly-downloadable model in the world (2023)." },

  // Audio
  { id: "kokoro-82m", name: "Kokoro-82M", cat: "audio", size: "427 MB", fmt: "ONNX / HF", repo: "hexgrad/Kokoro-82M", license: "Apache-2.0", runner: _r("kokoro-onnx", "https://github.com/thewh1teagle/kokoro-onnx"), cmd: "kokoro.create(text, voice='bm_fable')", desc: "Tiny, fast, high-quality text-to-speech — the voice this very site reads with." },
  { id: "whisper-v3-turbo", name: "Whisper-Large-v3-Turbo", cat: "audio", size: "1.5 GB", fmt: "HF", repo: "openai/whisper-large-v3-turbo", license: "MIT", runner: _r("whisper.cpp", "https://github.com/ggml-org/whisper.cpp"), cmd: "whisper-cli -m ggml-large-v3-turbo.bin -f audio.wav", desc: "State-of-the-art open speech-to-text, in the fast turbo variant." },

  // Image
  { id: "sd-1-5", name: "Stable Diffusion 1.5", cat: "image", size: "4.0 GB", fmt: "safetensors", repo: "runwayml/stable-diffusion-v1-5", license: "CreativeML OpenRAIL-M", runner: COMFY, cmd: "Load v1-5-pruned-emaonly.safetensors in a Checkpoint Loader", desc: "The model that put open image generation in everyone's hands (2022). Removed upstream — preserved here." },
  { id: "sdxl", name: "Stable Diffusion XL", cat: "image", size: "6.5 GB", fmt: "safetensors", repo: "stabilityai/stable-diffusion-xl-base-1.0", license: "OpenRAIL++-M", runner: COMFY, cmd: "Load sd_xl_base_1.0.safetensors in a Checkpoint Loader", desc: "The 1024px successor — the open image workhorse." },
  { id: "flux-1-dev", name: "FLUX.1-dev", cat: "image", size: "6.3 GB", fmt: "GGUF · Q4_K_S", repo: "city96/FLUX.1-dev-gguf", license: "FLUX.1-dev (non-commercial)", runner: _r("ComfyUI-GGUF", "https://github.com/city96/ComfyUI-GGUF"), cmd: "Load flux1-dev-Q4_K_S.gguf with the ComfyUI-GGUF unet loader", desc: "Black Forest Labs' flow model — near-frontier open image quality." },

  // GGUF LLMs
  { id: "llama-3.1-8b", name: "Llama-3.1-8B-Instruct", cat: "llm", size: "4.6 GB", fmt: "GGUF · Q4_K_M", repo: "bartowski/Meta-Llama-3.1-8B-Instruct-GGUF", license: "Llama 3.1 Community", runner: LLAMA, cmd: "llama-cli -m Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf -p \"Hello\"", desc: "Meta's compact instruct model — runs on a laptop." },
  { id: "gemma-2-9b", name: "Gemma-2-9B-it", cat: "llm", size: "5.4 GB", fmt: "GGUF · Q4_K_M", repo: "bartowski/gemma-2-9b-it-GGUF", license: "Gemma", runner: LLAMA, cmd: "llama-cli -m gemma-2-9b-it-Q4_K_M.gguf -p \"Hello\"", desc: "Google DeepMind's efficient 9B." },
  { id: "qwen25-coder-32b", name: "Qwen2.5-Coder-32B-Instruct", cat: "llm", size: "18 GB", fmt: "GGUF · Q4_K_M", repo: "Qwen/Qwen2.5-Coder-32B-Instruct-GGUF", license: "Apache-2.0", runner: LLAMA, cmd: "llama-cli -m qwen2.5-coder-32b-instruct-q4_k_m.gguf -p \"write a function\"", desc: "A top open coding model." },
  { id: "deepseek-r1-distill-32b", name: "DeepSeek-R1-Distill-Qwen-32B", cat: "llm", size: "18 GB", fmt: "GGUF · Q4_K_M", repo: "bartowski/DeepSeek-R1-Distill-Qwen-32B-GGUF", license: "MIT", runner: LLAMA, cmd: "llama-cli -m DeepSeek-R1-Distill-Qwen-32B-Q4_K_M.gguf -p \"Think:\"", desc: "Chain-of-thought reasoning distilled into a 32B you can run at home." },
  { id: "llama-3.3-70b", name: "Llama-3.3-70B-Instruct", cat: "llm", size: "40 GB", fmt: "GGUF · Q4_K_M", repo: "bartowski/Llama-3.3-70B-Instruct-GGUF", license: "Llama 3.3 Community", runner: LLAMA, cmd: "llama-cli -m Llama-3.3-70B-Instruct-Q4_K_M.gguf -p \"Hello\"", desc: "Meta's 70B — near-frontier, runs locally on a strong machine." },
  { id: "gpt-oss-20b", name: "GPT-OSS-20B", cat: "llm", size: "11 GB", fmt: "GGUF · Q4_K_M", repo: "unsloth/gpt-oss-20b-GGUF", license: "Apache-2.0", runner: LLAMA, cmd: "llama-cli -m gpt-oss-20b-Q4_K_M.gguf -p \"Hello\"", desc: "OpenAI's open-weight 20B." },
  { id: "gemma-4-31b", name: "Gemma-4-31B-it", cat: "llm", size: "17 GB", fmt: "GGUF · Q4_K_M", repo: "unsloth/gemma-4-31B-it-GGUF", license: "Gemma", runner: LLAMA, cmd: "llama-cli -m gemma-4-31B-it-Q4_K_M.gguf -p \"Hello\"", desc: "Google DeepMind's newer 31B." },
  { id: "gpt-oss-120b", name: "GPT-OSS-120B", cat: "llm", size: "58 GB", fmt: "GGUF · Q4", repo: "unsloth/gpt-oss-120b-GGUF", license: "Apache-2.0", runner: LLAMA, cmd: "llama-cli -m gpt-oss-120b-Q4_K_M-00001-of-*.gguf -p \"Hello\"", desc: "OpenAI's larger open-weight model." },
  { id: "deepseek-r1-671b", name: "DeepSeek-R1 (671B)", cat: "llm", size: "377 GB", fmt: "GGUF · Q4", repo: "unsloth/DeepSeek-R1-GGUF", license: "MIT", runner: LLAMA, cmd: "llama-cli -m DeepSeek-R1-Q4_K_M-00001-of-*.gguf -p \"Think:\"", desc: "The full 671B mixture-of-experts reasoning model, quantised to run on a big rig." },
  { id: "glm-5.2", name: "GLM-5.2", cat: "llm", size: "434 GB", fmt: "GGUF · Q4", repo: "unsloth/GLM-5.2-GGUF", license: "see source", runner: LLAMA, cmd: "llama-cli -m GLM-5.2-Q4_K_M-00001-of-*.gguf -p \"Hello\"", desc: "A frontier-scale open mixture-of-experts model." },
];
