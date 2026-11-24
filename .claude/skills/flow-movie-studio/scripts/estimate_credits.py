#!/usr/bin/env python3
"""Estimate shots and Google Flow credits for a target runtime.

Usage:
  python estimate_credits.py --minutes 20
  python estimate_credits.py --minutes 3 --clip-seconds 8 --credits-per-minute 240 --takes 1

Defaults come from the skill's planning rule: about 240 credits per finished
minute (20 minutes ~ 4,800 credits) with 1 clip per shot. Flow prices change,
so the rate is a flag; pass the rate the user sees in their Flow plan.
"""
import argparse
import json
import math


def estimate(minutes, clip_seconds=8.0, credits_per_minute=240.0, takes=1, retake_buffer=0.15):
    if minutes <= 0 or minutes > 60:
        raise SystemExit("minutes must be more than 0 and at most 60")
    shots = math.ceil(minutes * 60 / clip_seconds)
    base = minutes * credits_per_minute * takes
    per_clip = credits_per_minute * clip_seconds / 60
    buffered = base * (1 + retake_buffer)
    return {
        "runtime_minutes": minutes,
        "clip_seconds": clip_seconds,
        "shots": shots,
        "takes_per_shot": takes,
        "credits_per_clip": round(per_clip, 1),
        "estimated_credits": round(base),
        "with_retake_buffer": round(buffered),
        "retake_buffer_pct": round(retake_buffer * 100),
        "first_5_shots_credits": round(per_clip * takes * min(shots, 5)),
    }


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--minutes", type=float, required=True)
    p.add_argument("--clip-seconds", type=float, default=8.0)
    p.add_argument("--credits-per-minute", type=float, default=240.0)
    p.add_argument("--takes", type=int, default=1, help="clips generated per shot (Flow's default is 2)")
    p.add_argument("--retake-buffer", type=float, default=0.15)
    a = p.parse_args()
    print(json.dumps(estimate(a.minutes, a.clip_seconds, a.credits_per_minute, a.takes, a.retake_buffer), indent=2))
