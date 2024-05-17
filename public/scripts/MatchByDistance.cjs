const peq = new Uint32Array(0x10000);
const myers_32 = (a, b) => {
  const n = a.length;
  const m = b.length;
  const lst = 1 << (n - 1);
  let pv = -1;
  let mv = 0;
  let sc = n;
  let i = n;
  while (i--) {
    peq[a.charCodeAt(i)] |= 1 << i;
  }
  for (i = 0; i < m; i++) {
    let eq = peq[b.charCodeAt(i)];
    const xv = eq | mv;
    eq |= ((eq & pv) + pv) ^ pv;
    mv |= ~(eq | pv);
    pv &= eq;
    if (mv & lst) {
      sc++;
    }
    if (pv & lst) {
      sc--;
    }
    mv = (mv << 1) | 1;
    pv = (pv << 1) | ~(xv | mv);
    mv &= xv;
  }
  i = n;
  while (i--) {
    peq[a.charCodeAt(i)] = 0;
  }
  return sc;
};
const myers_x = (b, a) => {
  const n = a.length;
  const m = b.length;
  const mhc = [];
  const phc = [];
  const hsize = Math.ceil(n / 32);
  const vsize = Math.ceil(m / 32);
  for (let i = 0; i < hsize; i++) {
    phc[i] = -1;
    mhc[i] = 0;
  }
  let j = 0;
  for (; j < vsize - 1; j++) {
    let mv = 0;
    let pv = -1;
    const start = j * 32;
    const vlen = Math.min(32, m) + start;
    for (let k = start; k < vlen; k++) {
      peq[b.charCodeAt(k)] |= 1 << k;
    }
    for (let i = 0; i < n; i++) {
      const eq = peq[a.charCodeAt(i)];
      const pb = (phc[(i / 32) | 0] >>> i) & 1;
      const mb = (mhc[(i / 32) | 0] >>> i) & 1;
      const xv = eq | mv;
      const xh = ((((eq | mb) & pv) + pv) ^ pv) | eq | mb;
      let ph = mv | ~(xh | pv);
      let mh = pv & xh;
      if ((ph >>> 31) ^ pb) {
        phc[(i / 32) | 0] ^= 1 << i;
      }
      if ((mh >>> 31) ^ mb) {
        mhc[(i / 32) | 0] ^= 1 << i;
      }
      ph = (ph << 1) | pb;
      mh = (mh << 1) | mb;
      pv = mh | ~(xv | ph);
      mv = ph & xv;
    }
    for (let k = start; k < vlen; k++) {
      peq[b.charCodeAt(k)] = 0;
    }
  }
  let mv = 0;
  let pv = -1;
  const start = j * 32;
  const vlen = Math.min(32, m - start) + start;
  for (let k = start; k < vlen; k++) {
    peq[b.charCodeAt(k)] |= 1 << k;
  }
  let score = m;
  for (let i = 0; i < n; i++) {
    const eq = peq[a.charCodeAt(i)];
    const pb = (phc[(i / 32) | 0] >>> i) & 1;
    const mb = (mhc[(i / 32) | 0] >>> i) & 1;
    const xv = eq | mv;
    const xh = ((((eq | mb) & pv) + pv) ^ pv) | eq | mb;
    let ph = mv | ~(xh | pv);
    let mh = pv & xh;
    score += (ph >>> (m - 1)) & 1;
    score -= (mh >>> (m - 1)) & 1;
    if ((ph >>> 31) ^ pb) {
      phc[(i / 32) | 0] ^= 1 << i;
    }
    if ((mh >>> 31) ^ mb) {
      mhc[(i / 32) | 0] ^= 1 << i;
    }
    ph = (ph << 1) | pb;
    mh = (mh << 1) | mb;
    pv = mh | ~(xv | ph);
    mv = ph & xv;
  }
  for (let k = start; k < vlen; k++) {
    peq[b.charCodeAt(k)] = 0;
  }
  return score;
};
const distance = (a, b) => {
  if (a.length < b.length) {
    const tmp = b;
    b = a;
    a = tmp;
  }
  if (b.length === 0) {
    return a.length;
  }
  if (a.length <= 32) {
    return myers_32(a, b);
  }
  return myers_x(a, b);
};

module.exports = ({definition1, definition2, relations, parentList, childList}) => {
  console.log(`Processing for: ${definition1.id} & ${definition2.id}`);
  const json1 = JSON.parse(definition1.json);
  const json2 = JSON.parse(definition2.json);

  const text1 = json1.data.description + json1.data.first_mes;
  const text2 = json2.data.description + json2.data.first_mes;

  const measurement = distance(text1, text2);
  const maxLength = Math.max(text1.length, text2.length);
  const normalizedDistance = measurement / maxLength;
  const similarity = 1 - normalizedDistance;

  if (similarity >= 0.9) {
    const newRelations = [];
    if (parentList.has(definition2.id)) {
      newRelations.push({ current_id: definition1.id, old_id: definition2.id });
      childList.add(definition2.id);

      relations.filter(x => x.current_id === definition2.id).forEach(x => {
        newRelations.push({ current_id: definition1.id, old_id: x.old_id });
      });

      return {relations: newRelations, childId: definition2.id};
    }

    if (!childList.has(definition1.id)) {
      newRelations.push({ current_id: definition1.id, old_id: definition2.id });
      return {relations: newRelations};
    }
  }
};
