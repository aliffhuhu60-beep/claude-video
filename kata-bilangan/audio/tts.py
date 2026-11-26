"""Jana suara latar (edge-tts, ms-MY-YasminNeural) + masa setiap perkataan."""
import certifi, sys, json, asyncio, os
if os.path.exists("/root/.ccr/ca-bundle.crt"):
    certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import edge_tts

VOICE = "ms-MY-YasminNeural"
SEG = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)

async def one(i, s):
    c = edge_tts.Communicate(s["text"], VOICE, rate=s.get("rate", "+0%"), boundary="WordBoundary")
    words = []
    with open(f"{OUT}/{s['id']}.mp3", "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"w": ch["text"], "t": ch["offset"]/1e7, "d": ch["duration"]/1e7})
    return {"id": s["id"], "words": words}

async def main():
    res = [await one(i, s) for i, s in enumerate(SEG)]
    json.dump(res, open(f"{OUT}/words.json", "w"), indent=1, ensure_ascii=False)
asyncio.run(main())
