import { FiniteStateMachine } from './classes/finite-state-machine'

export type Transitions<States extends string, Data, Context extends object> = Record<
    States,
    (machine: FiniteStateMachine<States, Data, Context>) => States | undefined
>

export type Setters<States extends string, Data, Context extends object> = Record<
    States,
    // @TODO: add type safety any should be the input type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (input: any, machine: FiniteStateMachine<States, Data, Context>) => Partial<Data>
>

export type Effects<States extends string, Data, Context extends object> = Partial<
    Record<States, (machine: FiniteStateMachine<States, Data, Context>) => Promise<void> | void>
>

export type Runners<States extends string, Data, Context extends object> = Partial<
    Record<
        States,
        (
            machine: FiniteStateMachine<States, Data, Context>
        ) => Partial<Data> | Promise<Partial<Data>>
    >
>

export type OnEnd<States extends string, Data, Context extends object> = (
    machine: FiniteStateMachine<States, Data, Context>
) => void

export type MachineDefinition<States extends string, Data, Context extends object> = {
    context?     : Context;
    effects?     : Effects<States, Data, Context>;
    initialData  : Partial<Data>;
    initialState : States;
    runners?     : Runners<States, Data, Context>;
    setters?     : Setters<States, Data, Context>;
    transitions  : Transitions<States, Data, Context>;
}
