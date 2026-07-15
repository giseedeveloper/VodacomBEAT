# BizTune MMS Fine-Tune Plan

Goal: replace the default `facebook/mms-tts-swh` checkpoint with **BizTune-owned**
male/female voices that are safe for commercial caller-tune production.

## Phase A — Record source audio (1–2 days)

1. Hire or use internal voice talent (1 female, 1 male), Tanzanian Swahili.
2. Record **200–500 short sentences** per voice in a quiet room:
   - business greetings, locations, CTAs, numbers, brand names
   - 16 kHz or 44.1 kHz WAV, mono, no music
3. Store raw files under `training-data/{voice}/raw/`.

Target corpora to augment (open license):

- Mozilla Common Voice Swahili (CC0)
- google/WaxalNLP `swa_tts` (CC-BY-SA-4.0)

## Phase B — Prepare dataset (1 day)

1. Normalize text (lowercase, punctuation consistent with MMS tokenizer).
2. Trim silence, peak-normalize to -1 dBFS.
3. Build metadata CSV: `path|text`
4. Split 90/10 train/validation.

## Phase C — Fine-tune MMS-VITS (2–3 days compute)

Base checkpoint: `facebook/mms-tts-swh`

Recommended stack (run on a GPU machine, not the 2 GB VPS):

```bash
git clone https://github.com/facebookresearch/fairseq
# or Hugging Face Trainer examples for VITS fine-tuning
python run_vits_finetuning.py \
  --model_name_or_path facebook/mms-tts-swh \
  --dataset_path ./training-data/biztune-female-v1 \
  --output_dir ./models/biztune-female-v1
```

Repeat for `biztune-male-v1`.

## Phase D — Deploy to VPS

1. Copy the exported checkpoint to the VPS:

```text
/opt/vodacom-caller-tunes/models/biztune-female-v1/
/opt/vodacom-caller-tunes/models/biztune-male-v1/
```

2. Mount into the worker container (see `docker-compose.prod.fast.yml`):

```yaml
ai-worker:
  volumes:
    - ./models:/app/models:ro
    - beat_hf_cache:/root/.cache/huggingface
```

3. Voice manifest already references:

- `local/biztune-female-v1`
- `local/biztune-male-v1`

4. Set default voice in `.env.production`:

```env
BEAT_DEFAULT_VOICE_ID=biztune-female-v1
```

5. Smoke test:

```bash
docker exec -it beat-ai-worker python scripts/test_tts.py --voice biztune-female-v1 --final
```

## Phase E — QA checklist

- [ ] Business name pronunciation correct (use pronunciation hints JSON)
- [ ] Duration ≤ 30 seconds
- [ ] No clipping; loudness around -16 LUFS after FFmpeg
- [ ] Preview has watermark; final is clean WAV 44.1 kHz mono
- [ ] License documentation stored for commercial use

## License note

- `facebook/mms-tts-swh` is **CC-BY-NC** → use for dev/staging only.
- Production should use **your fine-tuned checkpoint** trained on data you have
  rights to, or a model with a commercial-friendly license (e.g. Apache 2.0
  release after independent training).

## Customization levers (no Azure required)

| Need | How |
|------|-----|
| Male/female | separate fine-tuned checkpoints |
| Brand pronunciation | `pronunciation_hints` in script JSON |
| Speed / pacing | `speaking_rate` + FFmpeg trim |
| Preview vs final | `/v1/tts/preview` vs `/v1/tts/final` |
| Music bed | FFmpeg mix step (next pipeline phase) |
