# Modular Synth (React + TypeScript + Tone.js)

Browser-based modulaire synth om de basis van VCO/VCF/VCA te leren.

## Start
```bash
npm i
npm run dev
```
Open daarna de URL (meestal http://localhost:5173). Klik **Start Audio** en eventueel **Load Demo**.

## Patching
- **Klik-klik**: klik op een jack om te starten, klik op een compatibele jack om te verbinden.
- **Drag** werkt ook (mousedown → mouseup).
- Kleurcodes: blauw = audio, oranje = control/param, rood = event.

Control ↔ Param is compatibel (bijv. LFO/Sequencer CV → VCO FREQ).

## Modules
VCO, Noise, ADSR, LFO, Filter (LP/BP), VCA, Mixer(4), Multiple, Attenuator, Delay, Reverb, Gate/Clock, Sequencer16, Oscilloscope, Output.

## Demo
**Load Demo** legt automatisch:  
VCO→Filter→VCA→Mixer→Delay→Reverb→Output,  
ADSR→VCA CV, LFO→Filter cutoff, Sequencer CV→VCO freq, Clock→Sequencer clock, Sequencer gate→ADSR trig.

## Save/Load
- Save → download JSON
- Load → kies JSON

## Bekend
- Mono, simpele scope, sequencer clock-in basis.
