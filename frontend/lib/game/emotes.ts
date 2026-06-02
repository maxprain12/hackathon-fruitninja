/** Emotes 7TV del filtro GraphQL (búsqueda global). */

export interface EmoteMeta {
  id: string;
  name: string;
  kind: "good" | "bomb";
}

export function emoteUrl(id: string): string {
  return `https://cdn.7tv.app/emote/${id}/4x.webp`;
}

/** Memes que suman puntos al cortarlos. */
export const GOOD_EMOTES: EmoteMeta[] = [
  { id: "01KRAATHJTJWFXQNBM8PBS549H", name: "ouu", kind: "good" },
  { id: "01K8NF2WA8F35F3K2RF3ZZW9S5", name: "em", kind: "good" },
  { id: "01KN8KJEWAZPEPMK7SPPTP0PSP", name: "SCUBA", kind: "good" },
  { id: "01KJ5NR1E30D7WC38Q4NVCAJMW", name: "FEELSTHEAURA", kind: "good" },
  { id: "01KHX0HZR9TCARN7QWJ67ASP40", name: "sonion", kind: "good" },
  { id: "01KN5JT1F5H20NXDSRYCD328D5", name: "huu", kind: "good" },
  { id: "01KK7RNBRCMB0TK09VKRE34M7C", name: "RandomKid", kind: "good" },
  { id: "01KMK7SGR7HW0AQF9SKTDCXNAX", name: "AuraFarming", kind: "good" },
  { id: "01K8CDR7Z4SJQ5X9Y5R0W74TEV", name: "WAS", kind: "good" },
  { id: "01KF9HPMSZVCFM9M1VC2EEAT07", name: "uwo", kind: "good" },
  { id: "01FFD90B8R0009CAK0J14686AR", name: "KEKW", kind: "good" },
  { id: "01K2M2FMCD5M19YM6KTB4DHQ9D", name: "littlefuckassdog", kind: "good" },
  { id: "01KGANMQAGEK55XC1TTCQ0Q2Z2", name: "glorming", kind: "good" },
  { id: "01KK34JK7P949M6EQ8HBH0MQD4", name: "oLICKA", kind: "good" },
  { id: "01KKAYV4C9923F5SQ74S9MVN29", name: "nabs", kind: "good" },
  { id: "01FTFF6B900003AV56G21Q5ZBK", name: "PagDance", kind: "good" },
  { id: "01GS35SB300004RVBCVMBM61QY", name: "Sip", kind: "good" },
  { id: "01F79P997R0000DRDGH5T4H67G", name: "pikaDance", kind: "good" },
  { id: "01KKM3TH5WGJKJSSAM55ET27B5", name: "buzzybee", kind: "good" },
  { id: "01FFEVSB8R0000JT8GHDKHHA5E", name: "yes", kind: "good" },
  { id: "01FFFAQE380000JT8GHDKHHB7T", name: "CatUFO", kind: "good" },
  { id: "01G033JF400008WN11V1V5A9CA", name: "FeelsDankerMan", kind: "good" },
  { id: "01FAWXEFH8000C0Z8TR69TGKGX", name: "HogRider", kind: "good" },
  { id: "01FX2XHBWR000FG2VJF7248SH9", name: "forsenPossesed", kind: "good" },
  { id: "01G2VQVAS0000EXSHAT1P4N2QH", name: "ApuConfused", kind: "good" },
  { id: "01FBPY09M00002VHTZH99A0HV9", name: "kekwdisco", kind: "good" },
  { id: "01FNQ2B6PG000EJT2EVEY3EZ20", name: "UMAD", kind: "good" },
  { id: "01GX4N9X08000FRDHR6A82TGN3", name: "rvdSo", kind: "good" },
  { id: "01H5K52TJR0007SK9E6EYS5NF1", name: "peepoWar", kind: "good" },
  { id: "01HV4Y0S3G0007838DQ0AM87MF", name: "wideWalk", kind: "good" },
  { id: "01HBP46K100004NH6VHZPR9ZSK", name: "raccoonSpin", kind: "good" },
  { id: "01GBE3RMJ8000E7PMG5MJNHPRT", name: "justinKelch", kind: "good" },
  { id: "01GAVG70T80007VXAFENF5KQSN", name: "MaDxHappy", kind: "good" },
  { id: "01F6MQNS4G000B6MDRT708FDV5", name: "upA", kind: "good" },
  { id: "01G9ZQ86Z0000317G3ZPBYE60A", name: "HUH", kind: "good" },
  { id: "01H16S6ZS00000VMYJAHS8EBR9", name: "noLife", kind: "good" },
  { id: "01H3SGSGW0000BH97SCKY1C4N2", name: "lel", kind: "good" },
  { id: "01H4210YG0000D3PSG84TT3HJJ", name: "woas", kind: "good" },
  { id: "01FDD9KK4G0003K4609T919YYX", name: "BRUH", kind: "good" },
  { id: "01FXVVB8XR000AY6WE2SPE81JE", name: "SiSi", kind: "good" },
  { id: "01G2VY1EM0000EXSHAT1P4N2ZR", name: "staree", kind: "good" },
  { id: "01F8DJ4VCR00056J6Z2TGS5BA9", name: "ApuSipSpin", kind: "good" },
  { id: "01GNMD7PZ80006MJ081A8KS2S9", name: "HamsterRave", kind: "good" },
  { id: "01F6YXT138000DFR2MAAXQRC0H", name: "peepoOkayDankApproved", kind: "good" },
  { id: "01FR6T094G0004S3BM30B16N8T", name: "PAAAAAG", kind: "good" },
  { id: "01HN8Y97TG0008Y0WDTPT0G4AX", name: "RETRORELAXO", kind: "good" },
  { id: "01F7Y9CE7G000EW4YZJ5NCAC9V", name: "SOSA", kind: "good" },
  { id: "01HVHHKWA00000KQWWFXFBDXMV", name: "yurr", kind: "good" },
  { id: "01KB5F00TNP4NTE5JRRHYX2SM4", name: "LETITRIDE", kind: "good" },
  { id: "01FJ7PX5RG000DH5MPCRYF6P11", name: "WideDuck", kind: "good" },
  { id: "01HZ1SDZV00006QBT86J97ZBJM", name: "gumo", kind: "good" },
  { id: "01FZ96606G00063WXMWQDKVQEC", name: "elisWeed", kind: "good" },
  { id: "01GQA9VPK8000ERT2YB38Q5JTS", name: "pepsi", kind: "good" },
  { id: "01FHR4VKT000093JSPCMYFBMZD", name: "WEH", kind: "good" },
  { id: "01FPJRX8G00001BCZZ99DVMNDT", name: "Geilo", kind: "good" },
  { id: "01FG527Q8R0005ESD4HCJDJHHY", name: "pepeD", kind: "good" },
  { id: "01J403MYFG0000E62RNK51MP2X", name: "shore", kind: "good" },
  { id: "01KMY06TEGH606ZWWHTBZ9KYP3", name: "scuba", kind: "good" },
  { id: "01KJR2MTWYRBJVCS5H5WEK9VN1", name: "Obsent", kind: "good" },
  { id: "01H27MB19G0002HDS6GKGJ4M7P", name: "AIM", kind: "good" },
  { id: "01K6EEBF8YC8JSBY89687CZ54E", name: "speedNod", kind: "good" },
  { id: "01FSJFG95R0000JPZ36BHMF8YW", name: "papaDumm", kind: "good" },
  { id: "01KN4R05A0GA9YZV4RTD72Y58W", name: "scuba", kind: "good" },
  { id: "01KMXZWX9C8FDPRG3VG36QKD5N", name: "scuba", kind: "good" },
];

/** Bombas: restan puntos. chud también aparece en búsqueda pero aquí es penalización. */
export const BOMB_EMOTES: EmoteMeta[] = [
  { id: "01KK3ZV02K136H3PXPDD2GJAZ0", name: "chud", kind: "bomb" },
  { id: "01HSCRRQBR0006X5PBHDB22PN5", name: "bomb", kind: "bomb" },
];

/** Muestra en la leyenda (no todos los 60+ good). */
export const LEGEND_GOOD_SAMPLE = GOOD_EMOTES.slice(0, 8);

const cache = new Map<string, HTMLImageElement>();

export function getEmoteImage(id: string): HTMLImageElement | undefined {
  return cache.get(id);
}

export function pickGoodEmoteId(): string {
  return GOOD_EMOTES[Math.floor(Math.random() * GOOD_EMOTES.length)].id;
}

export function pickBombEmoteId(): string {
  return BOMB_EMOTES[Math.floor(Math.random() * BOMB_EMOTES.length)].id;
}

export async function preloadEmotes(): Promise<void> {
  const ids = new Set<string>();
  for (const e of [...GOOD_EMOTES, ...BOMB_EMOTES]) ids.add(e.id);

  await Promise.all(
    [...ids].map(
      (id) =>
        new Promise<void>((resolve) => {
          if (cache.has(id)) {
            resolve();
            return;
          }
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            cache.set(id, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = emoteUrl(id);
        }),
    ),
  );
}
