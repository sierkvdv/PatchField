export const JACK_ALIAS: Record<string, string> = {
  // generic audio
  "in":"in","input":"in",
  "out":"out","output":"out",

  // filter
  "cutoff":"frequency","freq":"frequency","frequency":"frequency",
  "res":"q","resonance":"q","q":"q",

  // oscillator
  "pitch":"frequency","tune":"detune",

  // vca / gain
  "gain":"gain","level":"gain","amp":"gain",

  // envelope
  "attack":"attack","decay":"decay","sustain":"sustain","release":"release",

  // lfo
  "rate":"frequency","speed":"frequency","depth":"amplitude","amount":"amplitude",

  // fx common
  "time":"delayTime","delay":"delayTime","feedback":"feedback","wet":"wet","mix":"wet",

  // events
  "trig":"trig","trigger":"trig","gate":"gate","clock":"clock"
}

export function normalizePortId(id: string) {
  const key = String(id ?? "").toLowerCase()
  return JACK_ALIAS[key] ?? key
}
