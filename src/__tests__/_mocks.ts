import { Effects, Runners, Setters, Transitions } from 'src/types'

import { FiniteStateMachine } from '../classes/finite-state-machine'

export enum States {
    Age = 'age',
    FirstName = 'firstName',
    IsAllowed = 'isAllowed',
    LastName = 'lastName',
}

type Data = {
    age?       : number;
    firstName? : string;
    isAllowed? : boolean;
    lastName?  : string;
}

type Context = {
    legalAge : number;
}

function isAdult(age?: number, legalAge = 18) {
    return !!age && age >= legalAge
}

const transitions: Transitions<States, Data, Context> = {
    age : ({ data, context }) =>
        isAdult(data.age, context.legalAge) ? States.FirstName : States.IsAllowed,
    isAllowed : ({ data }) => (data.isAllowed ? States.FirstName : undefined),
    firstName : () => States.LastName,
    lastName  : () => undefined,
}

const setters: Setters<States, Data, Context> = {
    age       : (age: number, { context }) => ({ isAllowed: isAdult(age, context.legalAge), age }),
    isAllowed : (isAllowed: boolean) => ({ isAllowed }),
    firstName : (firstName: string) => ({ firstName }),
    lastName  : (lastName: string) => ({ lastName }),
}

const runners: Runners<States, Data, Context> = {
    age       : ({ context }) => ({ isAllowed: isAdult(18, context.legalAge), age: 18 }),
    isAllowed : () => new Promise((resolve) => resolve({ isAllowed: true })),
    firstName : () => new Promise((resolve) => resolve({ firstName: 'John' })),
    lastName  : () => new Promise((resolve) => resolve({ lastName: 'Doe' })),
}

const context: Context = {
    legalAge : 18,
}

export const mockedAgeEffect = jest.fn()
export const mockedFirstNameEffect = jest.fn()
export const mockedOnEnd = jest.fn()

const effects: Effects<States, Data, Context> = {
    age       : mockedAgeEffect,
    firstName : mockedFirstNameEffect,
}

export function makeMockedFSM(withRunners?: boolean, isImmutable?: boolean) {
    return new FiniteStateMachine(
        {
            runners      : withRunners ? runners : undefined,
            setters      : withRunners ? undefined : setters,
            initialState : States.Age,
            initialData  : {},
            transitions,
            effects,
            context,
        },
        mockedOnEnd,
        isImmutable
    )
}
