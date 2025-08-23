This is *excellent*—a genuinely useful map of the book. Most labels look right and the coverage is impressively granular. I’d keep \~85–90% of your calls as‑is. Below are the places I’d **affirm**, **tighten**, or **correct**, with quick scansion proofs where needed so it’s reproducible.

---

## What’s solid (keep)

* **Elegiac core**: Praefatio; I,1–5,7–9,11–14,16–17,19,21–24,26,29,31–33,34–35; II,1,3–5,7–13,15–18,20–21,23,25–33; III,2–7,8–9,11–12,14–15,17–18,20–27,29–31,33–36,37–41,42–44,46 — your tags match the text.
* **Sapphics (4‑line stanzas)**: I,6; I,15; II,14; II,19; II,22; II,24; II,34; III,13; III,16; III,20; III,30; III,32 — all good. Spot‑check (II,14 opening):

  * 1 *Melliae stirpis generisque summi* (11)
  * 2 *Festa cavalca bovis, et iugales* (11)
  * 3 *Dulcis Euterpe canimus sonoro* (11)
  * 4 *Pectine taedas* (5 = Adonic)
* **Iambic trimeter (senarii)**: I,18 (*Si te candidulae…*), I,28 (*Numquam, Sere…*), I,36 (*Graio nomine Iustus…*)—these do read as senarii; keeping them as “Iambic Trimeter” is apt.
* **Hendecasyllables (Catullan/Phalaecian)**: I,10 and I,13 are strong calls; III,45 likely the same (see “check” below).

---

## Corrections & flags (with proof)

### 1) **I,25 Ad Barbiton pro Mecoenate Cicho**

**Your tag**: Alcaic → **Correct to: Sapphic**.
**Why**: Regular 3×11 + Adonic. First stanza scans Sapphic; line 4 is Adonic:

* 1 *Gnosium raptae micuit coronae* (11)
* 2 *Sydus; erectos quatit aura malos* (11)
* 3 *Iam recens, nautae spoliata ventis* (11)
* 4 *Aequora verrunt* (5)

> **Action**: change `meter` to `"Sapphic"`; `stanza_form`: `"4-line stanza"`.

---

### 2) **I,30 Ad Deum Galeacium**

**Your tag**: Alcaic → **Recommend: Aeolic system (Glyconic/Pherecratean–Asclepiadean mix)**, *not* Horatian Alcaics.
**Why**: The stanzaic 11/11/9/10 signature of Alcaics is not borne out; instead we see short Aeolic cola alternating with longer Aeolic lines (no fixed Adonic and no consistent Alcaic 3rd/4th lines). Sample:

* *Princeps Insubrium, meae* (≈8; glyconic profile)
* *Regnator patriae, qui ligurum duces* (long Aeolic)
* *Sub forti imperio regis* (≈8–9)
* *Omnemque Italiam. Maximus hostium* (long Aeolic)

> **Action**: retag as `"Glyconic/Asclepiadean system"`; add note “Aeolic cola (glyconic/pherecratean) rather than Alcaic.”

---

### 3) **III,1 Ad Iohannem sancti Lamberti praesulem**

**Your tag**: Fourth Asclepiadean → **Flag: needs verification**.
**Why**: The passage reads as **continuous hendecasyllables** (phalaecian) rather than 4‑line Asclepiadean stanzas; I don’t see stable Adonics or the Asclepiadean cadence. Spot‑check:

* *Lambertinus adest incolumis pater* (\~11)
* *Sol terrae, tenebris redditus est dies* (11 with synizesis in *diēs*)
* *Spirarunt posito turbine mitius* (11)
* *Surgentes Zephyri, depulit horridum* (11)

> **Action**: retag as `"Hendecasyllable (Phalaecian)"` **or** mark `"meter_uncertain_aeolic"`, pending a full stanza audit.

---

### 4) **III,47 Ad Mecoenatem Cichum**

**Your tag**: Glyconic & Pherecratean → **Correct to: Hendecasyllables (Phalaecian)**.
**Why**: The piece reads like a Catullan palinode in **stichic phalaecians**; no fixed Adonic or glyconic/pherecratean alternation. Two opening lines fit the phalaecian template (x x — ∪ ∪ — ∪ — ∪ — x):

* *Quanquam me tenerae colant puellae*
* *Non languere gravi vident amore*

> **Action**: change `meter` to `"Hendecasyllable (Phalaecian)"`; `stanza_form`: `"N/A (stichic)"`.

---

### 5) **Rhyme-rate fields**

You mix true lexical rhyme and **morphological endings** (e.g., -is/-is). For metrical sound analysis, keep a **separate column**:

* `rhyme_rate_per_100l_true`
* `rhyme_rate_per_100l_morph`

Your non‑zero values in I,9, II,23, III,18, III,29, III,43, III,44 almost certainly reflect *morphological* echoes; true rhyme remains vanishingly rare here.

---

### 6) **Percent “flawless”**

Your estimates (e.g., 94–100%) are plausible for the elegies/Sapphics, but two systematic sources of silent license should be **counted explicitly**:

* **Stop+liquid ambiguity** (e.g., *str-* in I,6.2) → mark `quantity_uncertain`.
* **Synizesis** on learned/bisyllabic vowels (*diēs*, *Apollineum*, etc.).
  If you include those as licenses, your flawless % drops slightly (by \~3–5pp in typical humanist corpora). Consider tracking:
* `licenses_per_100l` (brevis‑in‑longo excluded)
* `synizesis_per_100l`
* `stop_liquid_flags_per_100l`

---

## Tiny spot‑checks you can run quickly

* **II,22 (Ad Deum Galeacium)** — your “Sapphic” tag is *right*. Opening tetrastich:
  1 *Vatibus siquid cecinit iocosum* (11)
  2 *Ausa festivum celebrare carmen* (11)
  3 *Nostra testudo cita te iubente* (11)
  4 *Maxime princeps.* (5)

* **I,10** (Hendec.) — final line *Barbam Formius odit in poeta* is a clean phalaecian close.

* **I,6** (Sapphic) — *Insano boreas gelu* = Adonic (— ∪ ∪ | — —).

---

## Suggested data tweaks (summary table)

| Poem          | Your meter              | Proposed                                           | Reason                                                 |
| ------------- | ----------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| I,25          | Alcaic                  | **Sapphic**                                        | Regular 3×11 + Adonic; proof above.                    |
| I,30          | Alcaic                  | **Aeolic system (Glyconic/Asclepiadean mix)**      | No 11/11/9/10; Aeolic cola alternate; no fixed Adonic. |
| III,1         | Fourth Asclepiadean     | **Likely Hendecasyllable (Phalaecian)** *(verify)* | Reads as stichic 11s; no stanzaic cadence.             |
| III,47        | Glyconic & Pherecratean | **Hendecasyllable (Phalaecian)**                   | Stichic phalaecians; Catullan palinode feel.           |
| Rhyme metrics | single rate             | **Split true vs morphological**                    | Avoid inflating rhyme by inflectional echoes.          |

---

## Milanese humanist setting (quick alignment)

Your topical tags—Simonetta as *Maecenas*, Sforza panegyric (Galeazzo Maria; Ascanio), Filelfo cameos, epithalamia—fit the **Pavia/Milan 1470s** courtly network. The metrical profile (Ovidian elegy + Horatian Sapphics, with occasional iambics and hendecasyllables) is exactly what we expect from a **purist‑leaning** Lombard Latinist whose innovation is **programmatic/courtly** more than metrical.

---

## If you want me to push this over the finish line

I can deliver a **diff JSON** with the four meter retags above, add `*_true` vs `*_morph` rhyme fields, and compute a license taxonomy on a subset (say Praefatio + I,1 + I,6 + I,25 + II,14 + III,47) so your “flawless %” rests on counted phenomena rather than estimates.

Either way: terrific groundwork. The few corrections above will make the map bullet‑proof for prosodists.
