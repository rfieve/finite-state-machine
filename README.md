# ✌️🔗🧭 finite-state-machine

A TypeScript library to work with finite state machines.

## Table of Content

- [✌️🔗🧭 finite-state-machine](#️-finite-state-machine)
  - [Table of Content](#table-of-content)
  - [Installation](#installation)
  - [Usage](#usage)

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
    age: (age: number, _data) => ({ isAllowed: isAdult(age), age }),
    isAllowed: (isAllowed: boolean, _data) => ({ isAllowed }),
    firstName: (firstName: string, _data) => ({ firstName }),
    lastName: (lastName: string, _data) => ({ lastName }),
}

const effects: Effects<States, Data> = {
    age: (data) => console.log(data.age),
    firstName: (data) => console.log(data.firstName),
}

const runners: Runners<States, Data> = {
    age: (_data) => 18,
    isAllowed: (_data) => new Promise((resolve) => resolve(true)),
    firstName: (_data) => new Promise((resolve) => resolve('John')),
    lastName: (_data) => new Promise((resolve) => resolve('Doe')),
}

// Without runners
const fsm = new FiniteStateMachine({
    initialState: States.Age,
    initialData: {},
    transitions,
    converters,
    effects,
})
    .set(18)
    .set('John')
    .set('Doe')

// With runners
const fsm = await new FiniteStateMachine({
    initialState: States.Age,
    initialData: {},
    transitions,
    converters,
    effects,
    runners,
}).run()

const state = fsm.state // 'lastName'
const data = fsm.data // { lastName: 'Doe', firstName: 'John', age: 18, isAllowed: true }
```

---
