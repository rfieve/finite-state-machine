export type Transitions<States extends string, Data> = Record<
    States,
    (data: Partial<Data>) => States | undefined
>

export type Converters<States extends string, Data> = Record<
    States,
    // @TODO: add type safety any should be the input type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (input: any, data: Partial<Data>) => Partial<Data>
>

export type Effects<States extends string, Data> = Partial<
    Record<States, (data: Partial<Data>) => Promise<void> | void>
>

export type Runners<States extends string, Data> = Partial<
    Record<
        States,
        // @TODO: add type safety any should be the input type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data: Partial<Data>) => Promise<any> | any
    >
>

export type MachineDefinition<States extends string, Data> = {
    converters   : Converters<States, Data>;
    effects?     : Effects<States, Data>;
    initialData  : Partial<Data>;
    initialState : States;
    runners?     : Runners<States, Data>;
    transitions  : Transitions<States, Data>;
}
