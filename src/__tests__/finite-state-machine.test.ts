import { makeMockedFSM, mockedAgeEffect, mockedFirstNameEffect, States } from './_mocks'

describe('FiniteStateMachine', () => {
    it('should transit correctly with setters', () => {
        const fsm = makeMockedFSM()

        expect(fsm.state).toBe(States.Age)
        expect(fsm.asMachineDefinition.initialState).toBe(States.Age)
        expect(fsm.current.data).toEqual({ data: {}, state: States.Age })
        expect(fsm.data).toEqual({})
        expect(fsm.asMachineDefinition.initialData).toEqual({})
        expect(fsm.nodes).toEqual([{ data: {}, state: States.Age }])

        // Answer '18' to 'Age'
        fsm.set(18)
        expect(fsm.state).toBe(States.FirstName)
        expect(fsm.asMachineDefinition.initialState).toBe(States.FirstName)
        expect(fsm.current.data).toEqual({ data: {}, state: States.FirstName })
        expect(fsm.data).toEqual({ age: 18, isAllowed: true })
        expect(fsm.asMachineDefinition.initialData).toEqual({ age: 18, isAllowed: true })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: {}, state: States.FirstName },
        ])
        expect(mockedAgeEffect).toHaveBeenCalledWith({ age: 18, isAllowed: true })

        // Go back to 'Age' and answer the same answer
        fsm.goTo(States.Age)
        expect(fsm.state).toBe(States.Age)
        fsm.set(18)
        expect(fsm.state).toBe(States.FirstName)
        expect(fsm.asMachineDefinition.initialState).toBe(States.FirstName)
        expect(fsm.current.data).toEqual({ data: {}, state: States.FirstName })
        expect(fsm.data).toEqual({ age: 18, isAllowed: true })
        expect(fsm.asMachineDefinition.initialData).toEqual({ age: 18, isAllowed: true })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: {}, state: States.FirstName },
        ])

        // Answer 'John' to 'FirstName'
        fsm.set('John')
        expect(fsm.state).toBe(States.LastName)
        expect(fsm.asMachineDefinition.initialState).toBe(States.LastName)
        expect(fsm.current.data).toEqual({ data: {}, state: States.LastName })
        expect(fsm.data).toEqual({ firstName: 'John', age: 18, isAllowed: true })
        expect(fsm.asMachineDefinition.initialData).toEqual({
            firstName : 'John',
            age       : 18,
            isAllowed : true,
        })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: { firstName: 'John' }, state: States.FirstName },
            { data: {}, state: States.LastName },
        ])
        expect(mockedFirstNameEffect).toHaveBeenCalledWith({
            firstName : 'John',
            age       : 18,
            isAllowed : true,
        })

        // Answer 'Doe' to 'LastName'
        fsm.set('Doe')
        expect(fsm.state).toBe('end')
        expect(fsm.asMachineDefinition.initialState).toBe('end')
        expect(fsm.current.data).toEqual({ data: {}, state: 'end' })
        expect(fsm.data).toEqual({ lastName: 'Doe', firstName: 'John', age: 18, isAllowed: true })
        expect(fsm.asMachineDefinition.initialData).toEqual({
            lastName  : 'Doe',
            firstName : 'John',
            age       : 18,
            isAllowed : true,
        })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: { firstName: 'John' }, state: States.FirstName },
            { data: { lastName: 'Doe' }, state: States.LastName },
        ])

        // Go back to 'First Name'
        fsm.goTo(States.FirstName)
        expect(fsm.state).toBe(States.FirstName)
        expect(fsm.asMachineDefinition.initialState).toBe(States.FirstName)
        expect(fsm.current.data).toEqual({ data: { firstName: 'John' }, state: States.FirstName })
        expect(fsm.data).toEqual({ lastName: 'Doe', firstName: 'John', age: 18, isAllowed: true })
        expect(fsm.asMachineDefinition.initialData).toEqual({
            lastName  : 'Doe',
            firstName : 'John',
            age       : 18,
            isAllowed : true,
        })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: { firstName: 'John' }, state: States.FirstName },
            { data: { lastName: 'Doe' }, state: States.LastName },
        ])

        // Answer 'Jane' to 'FirstName' instead
        fsm.set('Jane')
        expect(fsm.state).toBe('end')
        expect(fsm.asMachineDefinition.initialState).toBe('end')
        expect(fsm.current.data).toEqual({ data: {}, state: 'end' })
        expect(fsm.data).toEqual({ lastName: 'Doe', firstName: 'Jane', age: 18, isAllowed: true })
        expect(fsm.asMachineDefinition.initialData).toEqual({
            lastName  : 'Doe',
            firstName : 'Jane',
            age       : 18,
            isAllowed : true,
        })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: { firstName: 'Jane' }, state: States.FirstName },
            { data: { lastName: 'Doe' }, state: States.LastName },
        ])

        // Go back to 'Age'
        fsm.goTo(States.Age)
        expect(fsm.state).toBe(States.Age)
        expect(fsm.asMachineDefinition.initialState).toBe(States.Age)
        expect(fsm.current.data).toEqual({ data: { age: 18, isAllowed: true }, state: States.Age })
        expect(fsm.data).toEqual({ lastName: 'Doe', firstName: 'Jane', age: 18, isAllowed: true })
        expect(fsm.asMachineDefinition.initialData).toEqual({
            lastName  : 'Doe',
            firstName : 'Jane',
            age       : 18,
            isAllowed : true,
        })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: { firstName: 'Jane' }, state: States.FirstName },
            { data: { lastName: 'Doe' }, state: States.LastName },
        ])

        // Answer '10' to 'Age' instead
        fsm.set(10)
        expect(fsm.state).toBe(States.IsAllowed)
        expect(fsm.asMachineDefinition.initialState).toBe(States.IsAllowed)
        expect(fsm.current.data).toEqual({ data: {}, state: States.IsAllowed })
        expect(fsm.data).toEqual({ age: 10, isAllowed: false })
        expect(fsm.asMachineDefinition.initialData).toEqual({
            age       : 10,
            isAllowed : false,
        })
        expect(fsm.nodes).toEqual([
            { data: { age: 10, isAllowed: false }, state: States.Age },
            { data: {}, state: States.IsAllowed },
        ])

        // Answer 'false' to 'IsAllowed' instead
        fsm.set(false)
        expect(fsm.state).toBe('end')
        expect(fsm.asMachineDefinition.initialState).toBe('end')
        expect(fsm.current.data).toEqual({ data: {}, state: 'end' })
        expect(fsm.data).toEqual({ age: 10, isAllowed: false })
        expect(fsm.asMachineDefinition.initialData).toEqual({
            age       : 10,
            isAllowed : false,
        })
        expect(fsm.nodes).toEqual([
            { data: { age: 10, isAllowed: false }, state: States.Age },
            { data: { isAllowed: false }, state: States.IsAllowed },
        ])
    })

    it('should transit correctly with runners', async () => {
        const fsm = await makeMockedFSM(true).run()

        expect(fsm.state).toBe('end')

        expect(fsm.data).toEqual({
            lastName  : 'Doe',
            firstName : 'John',
            age       : 18,
            isAllowed : true,
        })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: { firstName: 'John' }, state: States.FirstName },
            { data: { lastName: 'Doe' }, state: States.LastName },
        ])
    })
})
