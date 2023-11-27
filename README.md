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

const converters: Converters<States, Data> = {
    age: (age: number, data) => ({ ...data, isAllowed: isAdult(age), age }),
    isAllowed: (isAllowed: boolean, data) => ({ ...data, isAllowed }),
    firstName: (firstName: string, data) => ({ ...data, firstName }),
    lastName: (lastName: string, data) => ({ ...data, lastName }),
}

const fsm = new FiniteStateMachine({
    initialState: States.Age,
    initialData: {},
    transitions,
    converters,
})
    .set(18)
    .set('John')
    .set('Doe')

const state = fsm.state // 'lastName'
const data = fsm.data // { lastName: 'Doe', firstName: 'John', age: 18, isAllowed: true }
```

---
