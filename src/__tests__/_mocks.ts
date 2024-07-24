import { FiniteStateMachine } from '../classes/finite-state-machine'
import { Setters, Effects, Runners, Transitions } from '../types'

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
    age       : (data, c) => (isAdult(data.age, c.legalAge) ? States.FirstName : States.IsAllowed),
    isAllowed : (data) => (data.isAllowed ? States.FirstName : undefined),
    firstName : () => States.LastName,
    lastName  : () => undefined,
}

const setters: Setters<States, Data, Context> = {
    age       : (age: number, _, c) => ({ isAllowed: isAdult(age, c.legalAge), age }),
    isAllowed : (isAllowed: boolean) => ({ isAllowed }),
    firstName : (firstName: string) => ({ firstName }),
    lastName  : (lastName: string) => ({ lastName }),
}

const runners: Runners<States, Data, Context> = {
    age       : (_, c) => ({ isAllowed: isAdult(18, c.legalAge), age: 18 }),
    isAllowed : () => new Promise((resolve) => resolve({ isAllowed: true })),
    firstName : () => new Promise((resolve) => resolve({ firstName: 'John' })),
    lastName  : () => new Promise((resolve) => resolve({ lastName: 'Doe' })),
}

const context: Context = {
    legalAge : 18,
}

export const mockedAgeEffect = jest.fn()
export const mockedFirstNameEffect = jest.fn()

const effects: Effects<States, Data, Context> = {
    age       : mockedAgeEffect,
    firstName : mockedFirstNameEffect,
}

export function makeMockedFSM(withRunners?: boolean) {
    return new FiniteStateMachine({
        runners      : withRunners ? runners : undefined,
        setters      : withRunners ? undefined : setters,
        initialState : States.Age,
        initialData  : {},
        transitions,
        effects,
        context,
    })
}
