# ✌️🔗🧭 finite-state-machine

A TypeScript library to work with finite-state machines.

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

const context = { legalAge: 18 }

const transitions: Transitions<States, Data> = {
    age: ({ age }, { legalAge }) => (isAdult(age, legalAge) ? States.FirstName : States.IsAllowed),
    isAllowed: ({ isAllowed }, _context) => (isAllowed ? States.FirstName : undefined),
    firstName: (_data, _context) => States.LastName,
    lastName: (_data, _context) => undefined,
}

const effects: Effects<States, Data> = {
    age: ({ age }, { legalAge }) => console.log(age, legalAge),
    firstName: ({ firstName }, _context) => console.log(firstName),
    lastName: (data, context) => console.log(data, context),
}

const baseMachineDef = { context, initialState: States.Age, initialData: {}, transitions, effects }

// With setters
const setters: Setters<States, Data> = {
    age: (age: number, _data, { legalAge }) => ({ isAllowed: isAdult(age, legalAge), age }),
    isAllowed: (isAllowed: boolean, _data, _context) => ({ isAllowed }),
    firstName: (firstName: string, _data, _context) => ({ firstName }),
    lastName: (lastName: string, _data, _context) => ({ lastName }),
}
const fsm = new FiniteStateMachine({ ...baseMachineDef, setters }).set(18).set('John').set('Doe')

// With runners
const runners: Runners<States, Data> = {
    age: (_data, _context) => ({ isAllowed: isAdult(18), age: 18 }),
    isAllowed: (_data, _context) => new Promise((resolve) => resolve({ isAllowed: true })),
    firstName: (_data, _context) => new Promise((resolve) => resolve({ firstName: 'John' })),
    lastName: (_data, _context) => new Promise((resolve) => resolve({ lastName: 'Doe' })),
}
const fsm = await new FiniteStateMachine({ ...baseMachineDef, runners }).run()

console.log(fsm.state) // 'lastName'
console.log(fsm.data) // { lastName: 'Doe', firstName: 'John', age: 18, isAllowed: true }
```

---
