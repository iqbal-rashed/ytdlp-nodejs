import { ProgressType } from "../utils/types";

type EventType = {
    progress: (progress: ProgressType) => void;
    error: (err: Error) => void;
    finished: () => void;
};

type ListenerType<T extends EventType> = {
    [K in keyof T]?: T[K][];
};

type EventName = keyof EventType;
type EventListener<T extends EventName> = EventType[T];

type EmitData<T extends EventName> = {
    progress: ProgressType;
    error: Error;
    finished: undefined;
}[T];

type ReturnEmit<T extends EventName> = T extends "error" ? void : boolean;

class EmitterEvent {
    private listeners: ListenerType<EventType> = {};

    protected emit<T extends EventName>(
        event: T,
        data: EmitData<T>
    ): ReturnEmit<T> {
        if (event == "error") {
            setTimeout(() => {
                let fns = this.listeners[event];
                if (!fns) throw data;

                fns.forEach((f) => {
                    f(data as any);
                });
            }, 1);
            return "" as any;
        }
        let fns = this.listeners[event];
        if (!fns) return false as any;
        fns.forEach((f) => {
            f(data as any);
        });
        return true as any;
    }

    public on<T extends EventName>(event: T, listener: EventListener<T>) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event]?.push(listener);
        return this;
    }
}

export default EmitterEvent;
