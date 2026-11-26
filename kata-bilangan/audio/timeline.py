"""Bina garis masa: kedudukan setiap klip suara + masa mutlak setiap perkataan."""
import json, sys
script = json.load(open("audio/script.json"))
words = {w["id"]: w["words"] for w in json.load(open("build/vo/words.json"))}
clips, prev_end = [], 0.0
for s in script:
    ws = words[s["id"]]; w0 = ws[0]["t"]
    at = s["at"] if "at" in s else prev_end + s["gap"]
    end = at + ws[-1]["t"] + ws[-1]["d"] - w0
    clips.append({"id": s["id"], "at": round(at, 3), "end": round(end, 3), "offset": w0,
                  "sub": s["sub"], "hideSub": s.get("hideSub", False),
                  "words": [{"w": w["w"], "t": round(at + w["t"] - w0, 3)} for w in ws]})
    prev_end = end
    print(f'{s["id"]:3} {at:6.2f} -> {end:6.2f}')
json.dump({"duration": 30.0, "fps": 30, "clips": clips}, open("build/timeline.json", "w"), indent=1, ensure_ascii=False)
