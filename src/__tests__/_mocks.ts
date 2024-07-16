import { FiniteStateMachine } from '../classes/finite-state-machine'
import { Converters, Effects, Runners, Transitions } from '../types'

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
function isAdult(age?: number) {
    return !!age && age >= 18
}

const transitions: Transitions<States, Data> = {
    age       : (data) => (isAdult(data.age) ? States.FirstName : States.IsAllowed),
    isAllowed : (data) => (data.isAllowed ? States.FirstName : undefined),
    firstName : (_data) => States.LastName,
    lastName  : (_data) => undefined,
}

const converters: Converters<States, Data> = {
    age       : (age: number, _data) => ({ isAllowed: isAdult(age), age }),
    isAllowed : (isAllowed: boolean, _data) => ({ isAllowed }),
    firstName : (firstName: string, _data) => ({ firstName }),
    lastName  : (lastName: string, _data) => ({ lastName }),
}

const runners: Runners<States, Data> = {
    age       : (_data) => 18,
    isAllowed : (_data) => new Promise((resolve) => resolve(true)),
    firstName : (_data) => new Promise((resolve) => resolve('John')),
    lastName  : (_data) => new Promise((resolve) => resolve('Doe')),
}

export const mockedAgeEffect = jest.fn()
export const mockedFirstNameEffect = jest.fn()

const effects: Effects<States, Data> = {
    age       : mockedAgeEffect,
    firstName : mockedFirstNameEffect,
}

export function makeMockedFSM(withRunners?: boolean) {
    return new FiniteStateMachine({
        runners      : withRunners ? runners : undefined,
        initialState : States.Age,
        initialData  : {},
        transitions,
        converters,
        effects,
    })
}
