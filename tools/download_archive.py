#!/usr/bin/env python3
import os
import sys
import shutil
from huggingface_hub import hf_hub_download, snapshot_download
from huggingface_hub.utils import GatedRepoError, RepositoryNotFoundError

# Configuration
BASE_DIR = "/Volumes/One Touch/models library"
DRY_RUN = False
TEST_RUN = False
YES_TO_ALL = False

# List of models to download: (friendly_name, repo_id, filename, relative_subfolder, is_large)
# If filename is None, the entire repository (or matching pattern) is downloaded.
MODELS = [
    # 1. Historical Museum Models (Milestones)
    ("GPT-J-6B (Historical LLM)", "EleutherAI/gpt-j-6b", None, "Historical_Models/GPT-J-6B", False),
    ("GPT-NeoX-20B (Historical LLM)", "EleutherAI/gpt-neox-20b", None, "Historical_Models/GPT-NeoX-20B", False),
    ("Vicuna-13B-v1.5 (Historical GGUF)", "TheBloke/vicuna-13B-v1.5-GGUF", "vicuna-13b-v1.5.Q4_K_M.gguf", "Historical_Models", False),
    ("Mistral-7B-v0.1 (Historical Base LLM)", "mistralai/Mistral-7B-v0.1", None, "Historical_Models/Mistral-7B-v0.1", False),
    ("Mixtral-8x7B-Instruct-v0.1 (Historical MoE GGUF)", "TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF", "mixtral-8x7b-instruct-v0.1.Q4_K_M.gguf", "Historical_Models", False),
    ("BLOOM-7.1B (Historical Multilingual GGUF)", "mradermacher/bloom-7b1-GGUF", "bloom-7b1.Q4_K_M.gguf", "Historical_Models", False),
    ("Falcon-180B-Chat (Historical Giant GGUF)", "TheBloke/Falcon-180B-Chat-GGUF", None, "Historical_Models/Falcon-180B-Chat", True), # Large (~108 GB)

    # 2. Audio & Speech-to-Text
    ("Kokoro-82M (TTS)", "hexgrad/Kokoro-82M", None, "Audio_TTS/Kokoro-82M", False),
    ("Whisper-Large-v3-Turbo (Audio Transcription)", "openai/whisper-large-v3-turbo", None, "Audio_TTS/Whisper-Large-v3-Turbo", False),
    
    # 3. Image Generators
    ("Stable Diffusion 1.5 (Image Gen)", "runwayml/stable-diffusion-v1-5", "v1-5-pruned-emaonly.safetensors", "Creative_Models", False),
    ("Stable Diffusion XL (Image Gen)", "stabilityai/stable-diffusion-xl-base-1.0", "sd_xl_base_1.0.safetensors", "Creative_Models", False),
    ("FLUX.1-Dev (Image Gen GGUF)", "city96/FLUX.1-dev-gguf", "flux1-dev-Q4_K_S.gguf", "Creative_Models", False),
    
    # 4. Small-to-Medium Local LLMs (GGUFs)
    ("Llama-3.1-8B-Instruct (GGUF)", "bartowski/Meta-Llama-3.1-8B-Instruct-GGUF", "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf", "GGUF_Models", False),
    ("Gemma-2-9B-IT (GGUF)", "bartowski/gemma-2-9b-it-GGUF", "gemma-2-9b-it-Q4_K_M.gguf", "GGUF_Models", False),
    ("Qwen-2.5-Coder-32B-Instruct (GGUF)", "Qwen/Qwen2.5-Coder-32B-Instruct-GGUF", "qwen2.5-coder-32b-instruct-q4_k_m.gguf", "GGUF_Models", False),
    ("DeepSeek-R1-Distill-Qwen-32B (GGUF)", "bartowski/DeepSeek-R1-Distill-Qwen-32B-GGUF", "DeepSeek-R1-Distill-Qwen-32B-Q4_K_M.gguf", "GGUF_Models", False),
    ("Llama-3.3-70B-Instruct (GGUF)", "bartowski/Llama-3.3-70B-Instruct-GGUF", "Llama-3.3-70B-Instruct-Q4_K_M.gguf", "GGUF_Models", False),
    ("GPT-OSS-20B (OpenAI Open-Source GGUF)", "unsloth/gpt-oss-20b-GGUF", "gpt-oss-20b-Q4_K_M.gguf", "GGUF_Models", False),
    ("Gemma-4-31B-it (Google DeepMind GGUF)", "unsloth/gemma-4-31B-it-GGUF", "gemma-4-31B-it-Q4_K_M.gguf", "GGUF_Models", False),
    ("Qwen3.6-27B (Alibaba GGUF)", "unsloth/Qwen3.6-27B-GGUF", "Qwen3.6-27B-Q4_K_M.gguf", "GGUF_Models", False),
    ("Qwen3.6-35B-A3B (Alibaba MoE GGUF)", "unsloth/Qwen3.6-35B-A3B-GGUF", "Qwen3.6-35B-A3B-UD-Q4_K_M.gguf", "GGUF_Models", False),
    
    # 5. Large Reasoning Models (GGUFs) - Optional/Prompted
    ("DeepSeek-R1 (Full 671B MoE Q4 GGUF)", "unsloth/DeepSeek-R1-GGUF", None, "GGUF_Models/DeepSeek-R1-Q4", True),
    ("GLM-5.2 (Full 744B MoE Q4 GGUF)", "unsloth/GLM-5.2-GGUF", None, "GGUF_Models/GLM-5.2-Q4", True),
    ("GPT-OSS-120B (OpenAI Open-Source GGUF)", "unsloth/gpt-oss-120b-GGUF", None, "GGUF_Models/gpt-oss-120b-Q4", True),
    ("Llama-4-Scout-17B-16E-Instruct (Meta GGUF)", "unsloth/Llama-4-Scout-17B-16E-Instruct-GGUF", None, "GGUF_Models/Llama-4-Scout", True),
    ("Llama-4-Maverick-17B-128E-Instruct (Meta GGUF)", "unsloth/Llama-4-Maverick-17B-128E-Instruct-GGUF", None, "GGUF_Models/Llama-4-Maverick", True)
]

def check_disk_space():
    total, used, free = shutil.disk_usage(BASE_DIR if os.path.exists(BASE_DIR) else "/Volumes/One Touch")
    # Convert to GB
    free_gb = free / (1024**3)
    return free_gb

def download_model(name, repo_id, filename, subfolder, is_large):
    target_dir = os.path.join(BASE_DIR, subfolder)
    os.makedirs(target_dir, exist_ok=True)
    
    print(f"\n==================================================")
    print(f"Starting Download: {name}")
    print(f"Repository: {repo_id}")
    if filename:
        print(f"File: {filename}")
    print(f"Destination: {target_dir}")
    print(f"==================================================")

    if DRY_RUN:
        print("[DRY RUN] Would download model files now.")
        return True

    try:
        if filename:
            # Download a single file
            filepath = hf_hub_download(
                repo_id=repo_id,
                filename=filename,
                local_dir=target_dir,
                local_dir_use_symlinks=False,
                resume_download=True
            )
            print(f"Successfully downloaded to: {filepath}")
        else:
            # Download entire repo or matching snapshot folder
            allow_patterns = None
            if "DeepSeek-R1-GGUF" in repo_id:
                allow_patterns = ["DeepSeek-R1-Q4_K_M/*"]
                print("Filtering repository download to only 'DeepSeek-R1-Q4_K_M/*' files...")
            elif "GLM-5.2-GGUF" in repo_id:
                allow_patterns = ["UD-Q4_K_M/*"]
                print("Filtering repository download to only 'UD-Q4_K_M/*' files...")
            elif "gpt-oss-120b-GGUF" in repo_id:
                allow_patterns = ["Q4_K_M/*"]
                print("Filtering repository download to only 'Q4_K_M/*' files...")
            elif "Llama-4-Scout" in repo_id or "Llama-4-Maverick" in repo_id:
                allow_patterns = ["Q4_K_M/*"]
                print("Filtering repository download to only 'Q4_K_M/*' files...")
            elif "Falcon-180B-Chat-GGUF" in repo_id:
                allow_patterns = ["*Q4_K_M.gguf-split-*"]
                print("Filtering repository download to only 'Q4_K_M' split files...")

            dirpath = snapshot_download(
                repo_id=repo_id,
                local_dir=target_dir,
                local_dir_use_symlinks=False,
                allow_patterns=allow_patterns,
                ignore_patterns=["*.msgpack", "*.h5", "*.ot"],
                resume_download=True
            )
            print(f"Successfully snapshot downloaded to: {dirpath}")
        return True

    except GatedRepoError:
        print(f"❌ Error downloading {name}: Gated repository.")
        print(f"   Please make sure you have accepted the terms on Hugging Face for '{repo_id}'")
        print(f"   and run `huggingface-cli login` in your terminal first.")
        return False
    except RepositoryNotFoundError:
        print(f"❌ Error: Repository '{repo_id}' not found.")
        return False
    except Exception as e:
        print(f"❌ Failed to download {name}. Error: {e}")
        return False

def main():
    global DRY_RUN, TEST_RUN, YES_TO_ALL
    if "--dry-run" in sys.argv:
        DRY_RUN = True
        print("--- RUNNING IN DRY RUN MODE ---")
    if "--test" in sys.argv:
        TEST_RUN = True
        print("--- RUNNING IN TEST MODE (Smallest model only) ---")
    if "--yes-to-all" in sys.argv:
        YES_TO_ALL = True
        print("--- RUNNING IN UNATTENDED MODE (Auto-approving large models) ---")

    print(f"Target Directory: {BASE_DIR}")
    free_space = check_disk_space()
    print(f"Available space on drive: {free_space:.2f} GB")

    success_count = 0
    failure_count = 0
    skipped_count = 0

    # Determine models list
    models_to_download = MODELS
    if TEST_RUN:
        # Only download the smallest model: Kokoro-82M
        for m in MODELS:
            if m[0] == "Kokoro-82M (TTS)":
                models_to_download = [m]
                break

    for name, repo_id, filename, subfolder, is_large in models_to_download:
        # Prompt for very large models unless in dry run, test run, or YES_TO_ALL is true
        if is_large and not DRY_RUN and not TEST_RUN and not YES_TO_ALL:
            print(f"\n⚠️ {name} is a very large model.")
            response = input("Do you want to download this model? (y/N): ").strip().lower()
            if response not in ('y', 'yes'):
                print(f"Skipping {name} to save space/bandwidth.")
                skipped_count += 1
                continue
        
        # Check disk space before starting
        free_space = check_disk_space()
        print(f"\nCurrent free space: {free_space:.2f} GB")
        if free_space < 10.0:  # Safety margin of 10 GB
            print("❌ Critical: Low disk space! Stopping archive process.")
            break

        success = download_model(name, repo_id, filename, subfolder, is_large)
        if success:
            success_count += 1
        else:
            failure_count += 1

    print("\n==================================================")
    print("Archive Script Execution Completed!")
    print(f"Success: {success_count} | Failures: {failure_count} | Skipped: {skipped_count}")
    print(f"Remaining free space on drive: {check_disk_space():.2f} GB")
    print("==================================================")

if __name__ == "__main__":
    main()
