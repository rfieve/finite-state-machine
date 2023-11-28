import { DLLNode } from '@romainfieve/doubly-linked-list'
import { DoublyLinkedListNavigator } from '@romainfieve/doubly-linked-list-navigator'

import { Converters, MachineDefinition, Transitions } from '../types'

export class FiniteStateMachine<States extends string, Data> {
    private dllNav!      : DoublyLinkedListNavigator<{ data: Partial<Data>; state: States }>
    private storedData!  : Partial<Data>
    private transitions! : Transitions<States, Data>
    private converters!  : Converters<States, Data>

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

    public get current() {
        return this.dllNav.current as DLLNode<{ data: Partial<Data>; state: States }>
    }

    public get nodes() {
        return this.dllNav.toArrayInOrder()
    }

    public get state() {
        return this.current.data.state
    }

    public get data() {
        return this.storedData
    }

    public readonly set = <Input>(input: Input) => {
        const converted = this.converters[this.state](input, this.storedData)
        return this.setDataOnCurrent(converted).setData(converted).transit()
    }

    private readonly transit = () => {
        const transition = this.transitions[this.state],
              state = transition(this.storedData)

        if (state && state !== this.state) {
            this.dllNav.insert({ data: {}, state }, () => 0, this.current)
            this.dllNav.goNext()
        }

        return this
    }

    private readonly setData = (data: Partial<Data>) => {
        this.storedData = Object.assign(this.storedData, data)
        return this
    }

    private readonly setDataOnCurrent = (data: Partial<Data>) => {
        this.current.data.data = data
        return this
    }
}
