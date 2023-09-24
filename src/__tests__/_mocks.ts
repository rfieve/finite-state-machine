import { FiniteStateMachine } from '../classes/finite-state-machine';
import { Converters, Transitions } from '../types';

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
};

function isAdult(age?: number) {
    return !!age && age >= 18;
}

const transitions: Transitions<States, Data> = {
    age       : (data) => (isAdult(data.age) ? States.FirstName : States.IsAllowed),
    isAllowed : (data) => (data.isAllowed ? States.FirstName : undefined),
    firstName : (_data) => States.LastName,
    lastName  : (_data) => undefined,
};

const converters: Converters<States, Data> = {
    age       : (age: number, data) => ({ ...data, isAllowed: isAdult(age), age }),
    isAllowed : (isAllowed: boolean, data) => ({ ...data, isAllowed }),
    firstName : (firstName: string, data) => ({ ...data, firstName }),
    lastName  : (lastName: string, data) => ({ ...data, lastName }),
};

export function makeMockedFSM() {
    return new FiniteStateMachine(States.Age, {}, transitions, converters);
}
