# Demo Script — TLH / SPH Efficiency Explorer

A ~4-minute safe walkthrough for a district/region team. Uses **synthetic demo data** so it's safe to screen-share.

## Setup (10 sec)
Open `app/index.html`. It boots on synthetic data — say so up front: *"These are fake facilities; the real version loads our weekly TLH/SPH export locally and nothing leaves the machine."* Point at the **Offline** badge and the **⚠ Synthetic demo data** badge.

## 1. The hook (45 sec) — headline cards
- *"Our efficiency number is SPH versus goal. But SPH is volume divided by hours — so it goes up two opposite ways: move more freight through the same hours, or cut hours under flat volume. One you replicate; the other you verify before you celebrate. The composite number can't tell them apart. This can."*
- Walk the four cards: net SPH move, how much came from throughput, how much from hours, and the primary-driver chip.

## 2. The contrast (90 sec) — the facility table
- **SYNTH-01**: *"Volume up ten percent on flat hours — a real throughput gain, purple bar, 'SPH-driven.' Go find what they changed and spread it."*
- **SYNTH-02**: *"Almost the same headline gain — but look at the split: blue. Same volume, ten percent fewer hours. Could be great scheduling. Could be under-staffing. The tool's job is to make sure we ask."*
- **SYNTH-03**: *"Efficiency fell — but the split shows it's a volume drop on held hours. That's a demand conversation, not a performance one."*
- **SYNTH-04**: *"Hours crept up eight percent on flat volume — a TLH-driven slip. That's a staffing-plan conversation."*
- Note the two effects **sum exactly** to the total — the status line shows the *split check ✓* on every render.

## 3. The dollars (30 sec)
- Point at the **$/SPH-point/year** input: *"Same translation the recap uses — effect × dollars-per-point ÷ 52. It's for sizing attention, not accounting."*

## 4. The recap (45 sec)
- Click **Draft recap**: *"It writes the explanation-of-change text locally — no AI, no network — already sorted into 'replicate,' 'verify first,' and 'investigate.' Notice the TLH-driven gains are explicitly labeled 'verify service and volume held before calling this a win.'"*

## 5. Close (20 sec)
- *"Two weeks is a noisy window — this pairs with the Signal Lab, which tells us whether a move is statistically real. This tells us which lever moved. Together that's the whole explanation-of-change conversation."*
- Invite a pilot: load one real weekly export locally, validate the split against the manual recap for two weeks.

## Do / Don't
- **Do** keep real data local; abstract facility codes in any screenshot that leaves the room.
- **Don't** present a TLH-driven gain as a productivity win before service/volume verification, and don't escalate a one-week split without the Signal Lab's trend view.
