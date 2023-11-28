import { makeMockedFSM, States } from './_mocks'

describe('FiniteStateMachine', () => {
    let fsm = makeMockedFSM()

    beforeEach(() => {
        fsm = makeMockedFSM()
    })

    it('should transit correctly', () => {
        expect(fsm.state).toBe(States.Age)
        expect(fsm.current.data).toEqual({ data: {}, state: States.Age })
        expect(fsm.data).toEqual({})
        expect(fsm.nodes).toEqual([{ data: {}, state: States.Age }])

        fsm.set(18)
        expect(fsm.state).toBe(States.FirstName)
        expect(fsm.current.data).toEqual({ data: {}, state: States.FirstName })
        expect(fsm.data).toEqual({ age: 18, isAllowed: true })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: {}, state: States.FirstName },
        ])

        fsm.set('John')
        expect(fsm.state).toBe(States.LastName)
        expect(fsm.current.data).toEqual({ data: {}, state: States.LastName })
        expect(fsm.data).toEqual({ firstName: 'John', age: 18, isAllowed: true })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: { firstName: 'John' }, state: States.FirstName },
            { data: {}, state: States.LastName },
        ])

        fsm.set('Doe')
        expect(fsm.state).toBe(States.LastName)
        expect(fsm.current.data).toEqual({ data: { lastName: 'Doe' }, state: States.LastName })
        expect(fsm.data).toEqual({ lastName: 'Doe', firstName: 'John', age: 18, isAllowed: true })
        expect(fsm.nodes).toEqual([
            { data: { age: 18, isAllowed: true }, state: States.Age },
            { data: { firstName: 'John' }, state: States.FirstName },
            { data: { lastName: 'Doe' }, state: States.LastName },
        ])
    })
})
