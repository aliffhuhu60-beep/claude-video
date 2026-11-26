"""Eksport sarikata .srt daripada garis masa."""
import json, re
TL = json.load(open("build/timeline.json"))["clips"]
ts = lambda t: f"{int(t//3600):02}:{int(t%3600//60):02}:{int(t%60):02},{int(round((t%1)*1000)):03}"
out = []
for i, c in enumerate(TL):
    nx = TL[i + 1]["at"] - 0.10 if i + 1 < len(TL) else 30.0
    end = min(c["end"] + 0.25, nx)
    out.append(f"{i+1}\n{ts(c['at']-0.08)} --> {ts(end)}\n{re.sub(r'[*~^]', '', c['sub'])}\n")
open("sarikata.srt", "w").write("\n".join(out))
print("\n".join(out))
