import { makeMockedFSM, States } from './_mocks';

describe('FiniteStateMachine', () => {
    let fsm = makeMockedFSM();

    beforeEach(() => {
        fsm = makeMockedFSM();
    });

    it('should transit correctly', () => {
        expect(fsm.state).toBe(States.Age);

        fsm.set(18);
        expect(fsm.data).toEqual({ age: 18, isAllowed: true });
        expect(fsm.state).toBe(States.FirstName);

        fsm.set('John');
        expect(fsm.data).toEqual({ firstName: 'John', age: 18, isAllowed: true });
        expect(fsm.state).toBe(States.LastName);

        fsm.set('Doe');
        expect(fsm.data).toEqual({ lastName: 'Doe', firstName: 'John', age: 18, isAllowed: true });
        expect(fsm.state).toBe(States.LastName);
    });
});
