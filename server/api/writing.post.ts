import Grammarify from 'grammarify-ts';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';

const substitutionMap = {
    // #s
    '2night': 'tonight',
    '2nite': 'tonight',

    // A
    asap: 'as soon as possible',
    asl: 'American Sign Language',

    // B
    bc: 'because',
    bf: 'boyfriend',
    btw: 'by the way',

    // C
    cuz: 'because',

    // D

    // E
    eg: 'example',
    els: 'else',

    // F
    f: 'female',
    ftw: 'for the win',
    fyi: 'for your information',

    // G
    gf: 'girlfriend',
    gotta: 'got to',
    gr8: 'great',

    // H
    hada: 'had a',
    hmu: 'hit me up',
    hr: 'hour',
    hrs: 'hours',

    // I
    idk: "I don't know",
    im: "I'm",

    // J
    jude: 'Jude', // how to expand this to all proper nouns??

    // K
    kinda: 'kind of',

    // L

    // M
    m: 'male',
    msg: 'message',

    // N
    nite: 'night',
    na: 'N/A',
    'n/a': 'N/A',

    // O
    omg: 'oh my gosh',

    // P
    pls: 'please',
    plz: 'please',
    ppl: 'people',

    // Q

    // R

    // S

    // T
    tbh: 'to be honest',
    tho: 'though',
    thru: 'through',
    tryna: 'trying to',

    // U
    u: 'you',

    // V

    // W
    w: 'with',
    wanna: 'want to',
    whaat: 'what', // spellchecker library thinks this is a word
    whaaat: 'what', // spellchecker library thinks this is a word
    wk: 'week',
    wks: 'weeks',
    wtf: 'what the fuck',
    wth: 'what the heck',
    wya: 'where are you at',

    // X

    // Y
    yknow: 'you know',

    // Z
};

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const body = await readBody(event);
    const correction = new Grammarify(substitutionMap);

    return new ApiResponse(StatusCode.OK, correction.clean(body.text));
});
