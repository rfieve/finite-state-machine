# ✌️🔗🧭 finite-state-machine

A TypeScript library to work with finite state machines.

## Table of Content

-   [✌️🔗🧭 finite-state-machine](#️-finite-state-machine)
    -   [Table of Content](#table-of-content)
    -   [Installation](#installation)
    -   [Usage](#usage)

## Installation

```sh
yarn add @romainfieve/finite-state-machine
```

or

```sh
npm install @romainfieve/finite-state-machine
```

## Usage

```typescript
const isAdult = (age?: number) => !!age && age >= 18

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

const transitions: Transitions<States, Data> = {
    age: (data) => (isAdult(data.age) ? States.FirstName : States.IsAllowed),
    isAllowed: (data) => (data.isAllowed ? States.FirstName : undefined),
    firstName: (_data) => States.LastName,
    lastName: (_data) => undefined,
}

const effects: Effects<States, Data> = {
    age: (data) => console.log(data.age),
    firstName: (data) => console.log(data.firstName),
}

const setters: Setters<States, Data> = {
    age: (age: number, _data) => ({ isAllowed: isAdult(age), age }),
    isAllowed: (isAllowed: boolean, _data) => ({ isAllowed }),
    firstName: (firstName: string, _data) => ({ firstName }),
    lastName: (lastName: string, _data) => ({ lastName }),
}

const runners: Runners<States, Data> = {
    age: (_data) => ({ isAllowed: isAdult(18), age: 18 }),
    isAllowed: (_data) => new Promise((resolve) => resolve({ isAllowed: true })),
    firstName: (_data) => new Promise((resolve) => resolve({ firstName: 'John' })),
    lastName: (_data) => new Promise((resolve) => resolve({ lastName: 'Doe' })),
}

const baseMachineDef = {
    initialState: States.Age,
    initialData: {},
    transitions,
    effects,
}

// With setters
const fsm = new FiniteStateMachine({ ...baseMachineDef, setters }).set(18).set('John').set('Doe')

// With runners
const fsm = await new FiniteStateMachine({ ...baseMachineDef, runners }).run()

const state = fsm.state // 'lastName'
const data = fsm.data // { lastName: 'Doe', firstName: 'John', age: 18, isAllowed: true }
```

---
