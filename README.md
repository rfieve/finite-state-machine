# finite-state-machine

A TypeScript library to work with finite-state machines.

## Table of Content

-   [finite-state-machine](#finite-state-machine)
    -   [Table of Content](#table-of-content)
    -   [Installation](#installation)
    -   [Options](#options)
    -   [Usage](#usage)

## Installation

```sh
yarn add @romainfieve/finite-state-machine
```

or

```sh
npm install @romainfieve/finite-state-machine
```

## Options

```typescript
/**
 * @param {MachineDefinition<States, Data, Context>} machineDefinition - The definition of the state machine.
 * @param {States} machineDefinition.initialState - The initial state of the state machine.
 * @param {Partial<Data>} [machineDefinition.initialData={}] - The initial machine data.
 * @param {Context} [machineDefinition.context={}] - The machine context.
 * @param {Transitions<States, Data, Context>} machineDefinition.transitions - The transition functions between states.
 * @param {Setters<States, Data, Context>} machineDefinition.setters - The conversion functions for input data at each state.
 * @param {Runners<States, Data, Context>} machineDefinition.runners - The runners for each state.
 * @param {Effects<States, Data, Context>} machineDefinition.effects - The side effects to trigger at each state.
 * @param onEnd - The side effect to trigger when the machine reaches the end.
 * @param isImmutable - Should the machine return a new instance at every state change.
 */
```

## Usage

```typescript
const isAdult = (age?: number, legalAge = 18) => !!age && age >= legalAge

enum States {
    Age = 'age',
    FirstName = 'firstName',
    IsAllowed = 'isAllowed',
    LastName = 'lastName',
}

type Data = {
    age?: number
    firstName?: string
    isAllowed?: boolean
    lastName?: string
}

type Context = {
    legalAge: number
}

type Machine = FiniteStateMachine<States, Data, Context>

const context = { legalAge: 18 }
const onEnd = ({ data, context }: Machine) => console.log(data, context)
const immutable = true

const transitions: Transitions<States, Data, Context> = {
    age: ({ data: { age }, constext: { legalAge } }) =>
        isAdult(age, legalAge) ? States.FirstName : States.IsAllowed,
    isAllowed: ({ data: { isAllowed } }) => (isAllowed ? States.FirstName : undefined),
    firstName: (_machine) => States.LastName,
    lastName: () => undefined,
}

const effects: Effects<States, Data, Context> = {
    age: ({ data: { age }, constext: { legalAge } }) => console.log(age, legalAge),
    firstName: ({ firstName }, _context) => console.log(firstName),
    lastName: (data, context) => console.log(data, context),
}

const baseMachineDef = { context, initialState: States.Age, initialData: {}, transitions, effects }

// With setters
const setters: Setters<States, Data, Context> = {
    age: (age: number, _data, { legalAge }) => ({ isAllowed: isAdult(age, legalAge), age }),
    isAllowed: (isAllowed: boolean, _data, _context) => ({ isAllowed }),
    firstName: (firstName: string, _data, _context) => ({ firstName }),
    lastName: (lastName: string, _data, _context) => ({ lastName }),
}
const fsm = new FiniteStateMachine({ ...baseMachineDef, setters }, onEnd, immutable)
    .set(18) // provide the value directly
    .set((_machine) => 'John') // or, set receives the machine as first arg when providing a function
    .set('Doe')
//

// With runners
const runners: Runners<States, Data, Context> = {
    age: (_data, _context) => ({ isAllowed: isAdult(18), age: 18 }),
    isAllowed: (_data, _context) => new Promise((resolve) => resolve({ isAllowed: true })),
    firstName: (_data, _context) => new Promise((resolve) => resolve({ firstName: 'John' })),
    lastName: (_data, _context) => new Promise((resolve) => resolve({ lastName: 'Doe' })),
}
const fsm = await new FiniteStateMachine({ ...baseMachineDef, runners }, onEnd, immutable).run()
//
// 18, true (age effect)
// 'John' (firstName effect)
// {...data}, {...context} (lastName effect)
// {...data}, {...context} (onEnd)
console.log(fsm.state) // 'lastName'
console.log(fsm.data) // { lastName: 'Doe', firstName: 'John', age: 18, isAllowed: true }
```

---
