import { DLLNode } from '@romainfieve/doubly-linked-list'
import { DoublyLinkedListNavigator } from '@romainfieve/doubly-linked-list-navigator'

import { Converters, MachineDefinition, Transitions } from '../types'

/**
 * Represents a finite state machine.
 * @template States - The enum representing the possible states of the machine.
 * @template Data - The type of data meant to be stored through the FSM process.
 */
export class FiniteStateMachine<States extends string, Data> {
    private dllNav!      : DoublyLinkedListNavigator<{ data: Partial<Data>; state: States }>
    private storedData!  : Partial<Data>
    private transitions! : Transitions<States, Data>
    private converters!  : Converters<States, Data>

    /**
     * Creates an instance of the FiniteStateMachine class.
     * @param {MachineDefinition<States, Data>} machineDefinition - The definition of the state machine.
     * @param {States} machineDefinition.initialState - The initial state of the state machine.
     * @param {Partial<Data>} [machineDefinition.initialData={}] - The initial machine data.
     * @param {Transitions<States, Data>} machineDefinition.transitions - The transition functions between states.
     * @param {Converters<States, Data>} machineDefinition.converters - The conversion functions for input data at each state.
     */
    constructor({
        initialState,
        initialData = {},
        transitions,
        converters,
    }: MachineDefinition<States, Data>) {
        this.dllNav = new DoublyLinkedListNavigator([{ data: initialData, state: initialState }])
        this.storedData = initialData
        this.transitions = transitions
        this.converters = converters
    }

    /**
     * Gets the current node in the doubly linked list representing the state machine.
     * @returns The current node.
     */
    public get current() {
        return this.dllNav.current as DLLNode<{ data: Partial<Data>; state: States }>
    }

    /**
     * Gets an array of nodes representing the states of the state machine in order.
     * @returns An array of nodes.
     */
    public get nodes() {
        return this.dllNav.toArrayInOrder()
    }

    /**
     * Gets the current state of the state machine.
     * @returns The current state.
     */
    public get state() {
        return this.current.data.state
    }

    /**
     * Gets the stored data associated with the current state.
     * @returns The stored data.
     */
    public get data() {
        return this.storedData
    }

    /**
     * Gets a machine defintion out the current state of the machine.
     * @returns The state machine definition.
     */
    public get asMachineDefinition() {
        return {
            initialData  : this.storedData,
            initialState : this.dllNav.current?.data.state,
            transitions  : this.transitions,
            converters   : this.converters,
        } as MachineDefinition<States, Data>
    }

    /**
     * Based on the input, sets stores the data based on the current state converter, then transits
     * to the new state depending on the current state transition and newly stored data.
     * @param input - The inputted piece of data at the current state
     * @returns The updated state machine.
     */
    public readonly set = <Input>(input: Input) => {
        const converted = this.converters[this.state](input, this.storedData)
        return this.setDataOnCurrent(converted).storeData(converted).transit()
    }

    /**
     * Performs the transition to the next state based on the current state and stored data.
     * @private
     * @returns The updated state machine.
     */
    private readonly transit = () => {
        const transition = this.transitions[this.state],
              state = transition(this.storedData)

        if (state && state !== this.state) {
            this.dllNav.insert({ data: {}, state }, () => 1, this.current)
            this.dllNav.goNext()
        }

        return this
    }

    /**
     * Assigns the inputted data to the machine stored data.
     * @private
     * @param data - The data to be set.
     * @returns The updated state machine.
     */
    private readonly storeData = (data: Partial<Data>) => {
        this.storedData = Object.assign(this.storedData, data)
        return this
    }

    /**
     * Assigns the inputted data to the current node.
     * @private
     * @param data - The data to be set.
     * @returns The updated state machine.
     */
    private readonly setDataOnCurrent = (data: Partial<Data>) => {
        this.current.data.data = data
        return this
    }
}
