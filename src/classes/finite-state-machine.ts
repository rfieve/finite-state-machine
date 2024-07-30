import { DLLNode } from '@romainfieve/doubly-linked-list'
import { DoublyLinkedListNavigator } from '@romainfieve/doubly-linked-list-navigator'

import { Setters, Effects, MachineDefinition, Runners, Transitions, OnEnd } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotFunction<T> = T extends (...args: any[]) => any ? never : T
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FirstArg<T> = T extends (a: infer U, ...arg: any[]) => any ? U : never

// type SetFuncArg<States extends string, Data, Context extends object, Arg> =

function isSetFuncArg<States extends string, Data, Context extends object, Arg>(
    arg: NotFunction<Arg> | ((machine: FiniteStateMachine<States, Data, Context>) => Arg)
): arg is (machine: FiniteStateMachine<States, Data, Context>) => Arg {
    return typeof arg === 'function'
}

/**
 * Represents a finite state machine.
 * @template States - The enum representing the possible states of the machine.
 * @template Data - The type of data meant to be stored through the FSM process.
 * @template Context - The machine context.
 */
export class FiniteStateMachine<States extends string, Data, Context extends object> {
    public context!      : Context
    public data!         : Partial<Data>
    private dllNav!      : DoublyLinkedListNavigator<{ data: Partial<Data>; state: States | 'end' }>
    private initialData! : Partial<Data>
    private transitions! : Transitions<States, Data, Context>
    private setters?     : Setters<States, Data, Context>
    private effects?     : Effects<States, Data, Context>
    private runners?     : Runners<States, Data, Context>
    private onEnd?       : OnEnd<States, Data, Context>
    private isImmutable? : boolean

    /**
     * Creates an instance of the FiniteStateMachine class.
     * @param {MachineDefinition<States, Data, Context>} machineDefinition - The definition of the state machine.
     * @param {States} machineDefinition.initialState - The initial state of the state machine.
     * @param {Partial<Data>} [machineDefinition.initialData={}] - The initial machine data.
     * @param {Context} [machineDefinition.context={}] - The machine context.
     * @param {Transitions<States, Data, Context>} machineDefinition.transitions - The transition functions between states.
     * @param {Setters<States, Data, Context>} machineDefinition.setters - The conversion functions for input data at each state.
     * @param {Runners<States, Data, Context>} machineDefinition.runners - The runners for each state.
     * @param {Effects<States, Data, Context>} machineDefinition.effects - The side effects to trigger at each state.
     * @param onEnd - The side effect to trigger when the machine reaches the end.
     * @param isImmutable - Should the machine return a new instance at every state change.
     */
    constructor(
        {
            initialState,
            initialData = {},
            transitions,
            setters,
            effects,
            runners,
            context = {} as Context,
        }: MachineDefinition<States, Data, Context>,
        onEnd?: OnEnd<States, Data, Context>,
        isImmutable?: boolean
    ) {
        this.dllNav = new DoublyLinkedListNavigator([
            { data: initialData, state: initialState as States | 'end' },
        ])
        this.data = initialData
        this.initialData = initialData
        this.transitions = transitions
        this.setters = setters
        this.effects = effects
        this.runners = runners
        this.context = context
        this.onEnd = onEnd
        this.isImmutable = isImmutable
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
     * Gets a machine defintion out the current state of the machine.
     * @returns The state machine definition.
     */
    public get asMachineDefinition() {
        return {
            initialData  : this.data,
            initialState : this.state,
            transitions  : this.transitions,
            setters      : this.setters,
            effects      : this.effects,
            runners      : this.runners,
            context      : this.context,
        } as MachineDefinition<States, Data, Context>
    }

    /**
     * Sets the machine to the provided state.
     * @param state - The targetted state
     * @returns The updated state machine.
     */
    public goTo(state: States) {
        if (state !== this.state) {
            // If we are at the tail without data, we cut the tail off.
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

        return this.instance()
    }

    /**
     * Based on the input, sets stores the data based on the current state converter, then transits
     * to the new state depending on the current state transition and newly stored data.
     * @param input - The inputted piece of data at the current state or a function to resolve it
     * @returns The updated state machine.
     */
    public set<Arg extends FirstArg<Setters<States, Data, Context>[States]>>(
        arg: NotFunction<Arg> | ((machine: FiniteStateMachine<States, Data, Context>) => Arg)
    ) {
        const setter = this.setters?.[this.state]
        const input = isSetFuncArg(arg) ? arg(this) : arg

        if (setter) {
            const data = setter(input, this)
            return this.setDataOnCurrent(data).storeData(data).triggerEffect().transit()
        }

        return this.instance()
    }

    /**
     * Runs the machine through the provided runners and stops at the first state without runner.
     * @returns The updated state machine.
     */
    public async run() {
        const runner = this.runners?.[this.state]

        if (runner) {
            const data = await runner(this)
            await this.setDataOnCurrent(data).storeData(data).triggerEffect().transit().run()
        }

        return this.instance()
    }

    /**
     * Triggers the effect linked to the current state (if any) with the stored data.
     * @private
     * @returns The state machine.
     */
    private triggerEffect() {
        const effect = this.effects?.[this.state]

        if (effect) {
            effect(this)
        }

        return this.instance()
    }

    /**
     * Performs the transition to the next state based on the current state and stored data.
     * @private
     * @returns The updated state machine.
     */
    private transit() {
        const transition = this.transitions[this.state],
              nextStateFromTransit = transition(this),
              nextStateFromCurrent =
                this.current.next?.data?.state &&
                this.current.next?.data?.data &&
                Object.values(this.current.next.data.data).length > 0
                    ? this.current.next?.data?.state
                    : undefined

        // No next state from transition, we shut down the machine.
        if (!nextStateFromTransit) {
            this.dllNav.push({ data: {}, state: 'end' }).goNext()

            this.onEnd?.(this)

            return this.instance()
        }

        // We are at the tail.
        if (!nextStateFromCurrent && nextStateFromTransit) {
            // So we insert the next state as the new tail, and move to it:
            this.dllNav.push({ data: {}, state: nextStateFromTransit }).goNext()

            return this.instance()
        }

        // We are not at the tail.
        // We cannot guarantee the next states are still relevant or valid.
        if (nextStateFromCurrent && nextStateFromCurrent === nextStateFromTransit) {
            // So we recursively transit to the next valid state.
            this.dllNav.goNext()
            this.transit()

            return this.instance()
        }

        // The next node's state is not valid.
        if (nextStateFromCurrent && nextStateFromCurrent !== nextStateFromTransit) {
            // So we cut it off.
            this.current.next = undefined
            this.dllNav.dll.tail = this.current

            // And we reapply the data of each node from the head, from initial data.
            this.data = this.initialData
            this.nodes.forEach((node) => this.storeData(node.data))
            this.transit()

            return this.instance()
        }

        return this.instance()
    }

    /**
     * Assigns the inputted data to the machine stored data.
     * @private
     * @param data - The data to be set.
     * @returns The updated state machine.
     */
    private storeData(data: Partial<Data>) {
        this.data = Object.assign({}, this.data, data)
        return this.instance()
    }

    /**
     * Assigns the inputted data to the current node.
     * @private
     * @param data - The data to be set.
     * @returns The updated state machine.
     */
    private setDataOnCurrent(data: Partial<Data>) {
        this.current.data.data = data
        return this.instance()
    }

    private instance() {
        return this.isImmutable
            ? new FiniteStateMachine(this.asMachineDefinition, this.onEnd, this.isImmutable)
            : this
    }
}
