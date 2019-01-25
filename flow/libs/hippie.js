declare module 'hippie' {
  declare type Hippie = {
    (string): Hippie,

    base: string => Hippie,

    post: string => Hippie,
    get: string => Hippie,
    send: Object => Hippie,
    end: () => Promise<any>,

    expectValue: (string, any) => Hippie,
    expectBody: any => Hippie,
    // FIXME: implement (res, body, next) parameter types
    expect: ((Object, Object, Function) => void) => any,
    json: () => Hippie,
  };
}
