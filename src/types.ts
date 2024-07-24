export type Transitions<States extends string, Data, Context> = Record<
    States,
    (data: Partial<Data>, context: Context) => States | undefined
>

export type Setters<States extends string, Data, Context> = Record<
    States,
    // @TODO: add type safety any should be the input type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (input: any, data: Partial<Data>, context: Context) => Partial<Data>
>

export type Effects<States extends string, Data, Context> = Partial<
    Record<States, (data: Partial<Data>, context: Context) => Promise<void> | void>
>

export type Runners<States extends string, Data, Context> = Partial<
    Record<
        States,
        (data: Partial<Data>, context: Context) => Partial<Data> | Promise<Partial<Data>>
    >
>

export type MachineDefinition<States extends string, Data, Context extends object> = {
    context?     : Context;
    effects?     : Effects<States, Data, Context>;
    initialData  : Partial<Data>;
    initialState : States;
    runners?     : Runners<States, Data, Context>;
    setters?     : Setters<States, Data, Context>;
    transitions  : Transitions<States, Data, Context>;
}
