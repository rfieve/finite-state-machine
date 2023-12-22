import { DLLNode } from '@romainfieve/doubly-linked-list'
import { DoublyLinkedListNavigator } from '@romainfieve/doubly-linked-list-navigator'

import { Converters, MachineDefinition, Transitions } from '../types'

/**
 * Represents a finite state machine.
 * @template States - The enum representing the possible states of the machine.
 * @template Data - The type of data meant to be stored through the FSM process.
 */
export class FiniteStateMachine<States extends string, Data> {
    private dllNav!      : DoublyLinkedListNavigator<{ data: Partial<Data>; state: States | 'end' }>
    private storedData!  : Partial<Data>
    private initialData! : Partial<Data>
    private transitions! : Transitions<States, Data>
    private converters!  : Converters<States, Data>
    private onEnd?       : (data: Partial<Data>) => void

    /**
     * Creates an instance of the FiniteStateMachine class.
     * @param {MachineDefinition<States, Data>} machineDefinition - The definition of the state machine.
     * @param {States} machineDefinition.initialState - The initial state of the state machine.
     * @param {Partial<Data>} [machineDefinition.initialData={}] - The initial machine data.
     * @param {Transitions<States, Data>} machineDefinition.transitions - The transition functions between states.
     * @param {Converters<States, Data>} machineDefinition.converters - The conversion functions for input data at each state.
     */
    constructor(
        {
            initialState,
            initialData = {},
            transitions,
            converters,
        }: MachineDefinition<States, Data>,
        onEnd?: (data: Partial<Data>) => void
    ) {
        this.dllNav = new DoublyLinkedListNavigator([
            { data: initialData, state: initialState as States | 'end' },
        ])
        this.storedData = initialData
        this.transitions = transitions
        this.converters = converters
        this.initialData = initialData
        this.onEnd = onEnd
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
        return this.dllNav.toArrayInOrder().filter((node) => node.state !== 'end')
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
            initialState : this.state,
            transitions  : this.transitions,
            converters   : this.converters,
        } as MachineDefinition<States, Data>
    }

    /**
     * Sets the machine to the provided state.
     * @param state - The targetted state
     * @returns The updated state machine.
     */
    public readonly goTo = (state: States) => {
        if (state !== this.state) {
            // If we are at the tail without data, we cut the tail off
            if (
                this.dllNav.tail?.data.state === this.state &&
                Object.values(this.current.data.data).length === 0
            ) {
                this.dllNav.goPrev()
                this.current.next = undefined
                this.dllNav.dll.tail = this.current
            }

            this.dllNav.goHead()

            while (this.state !== state) {
                this.dllNav.goNext()
            }
        }

        return this
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
              nextStateFromTransit = transition(this.storedData),
              nextStateFromCurrent =
                this.current.next?.data?.state &&
                this.current.next?.data?.data &&
                Object.values(this.current.next.data.data).length > 0
                    ? this.current.next?.data?.state
                    : undefined

        // No next state from transition, we shut down the machine.
        if (!nextStateFromTransit) {
            this.dllNav.push({ data: {}, state: 'end' }).goNext()

            this.onEnd?.(this.storedData)

            return this
        }

        // We are at the tail.
        if (!nextStateFromCurrent && nextStateFromTransit) {
            // So we insert the next state as the new tail, and move to it:
            this.dllNav.push({ data: {}, state: nextStateFromTransit }).goNext()

            return this
        }

        // We are not at the tail.
        // We cannot guarantee the next states are still relevant or valid.
        if (nextStateFromCurrent && nextStateFromCurrent === nextStateFromTransit) {
            // So we recursively transit to the next valid state.
            this.dllNav.goNext()
            this.transit()

            return this
        }

        // The next node's state is not valid.
        if (nextStateFromCurrent && nextStateFromCurrent !== nextStateFromTransit) {
            // So we cut it off.
            this.current.next = undefined
            this.dllNav.dll.tail = this.current

            // And we reapply the data of each node from the head, from initial data
            this.storedData = this.initialData
            this.nodes.forEach((node) => this.storeData(node.data))
            this.transit()

            return this
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
        this.storedData = Object.assign({}, this.storedData, data)
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
