export type Transitions<States extends string, Data> = Record<
    States,
    (data: Partial<Data>) => States | undefined
>;

export type Converters<States extends string, Data> = Record<
    States,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (input: any, data: Partial<Data>) => Partial<Data>
>;

export type MachineDefinition<States extends string, Data> = {
    data        : Data;
    transitions : Transitions<States, Data>;
};
