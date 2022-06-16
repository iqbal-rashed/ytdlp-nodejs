type EventName = "progress" | "finished" | "error" | "end";

class EmitterEvent {
    listeners: any = {};

    addListener(event: EventName, listener: (...args: any[]) => void) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(listener);
        return this;
    }
    on(event: EventName, listerner: (...args: any[]) => void) {
        return this.addListener(event, listerner);
    }
    removeListerner(event: EventName, listerner: (...args: any[]) => void) {
        let lis = this.listeners[event];
        if (!lis) return this;
        for (let i = lis.length; i > 0; i--) {
            const element = lis[i];
            if (element === listerner) {
                lis.splice(i, 1);
                break;
            }
        }
        return this;
    }

    off(event: EventName, listener: (...args: any[]) => void) {
        return this.removeListerner(event, listener);
    }
    once(event: EventName, listener: (...args: any[]) => void) {
        this.listeners = this.listeners[event] || [];
        const onceWrapper = () => {
            listener();
            this.off(event, onceWrapper);
        };
        this.listeners[event].push(onceWrapper);
        return this;
    }
    emit(event: EventName, ...args: any[]) {
        let fns = this.listeners[event];
        if (event === "error" && !fns) {
            throw new Error(args[0]);
        }
        if (!fns) return false;
        fns.forEach((f: (...args: any[]) => void) => {
            f(...args);
        });
        return true;
    }
    listernerCount(event: EventName) {
        let fns = this.listeners[event] || [];
        return fns.length;
    }
    rawListerner(event: EventName) {
        return this.listeners[event];
    }
}

export default EmitterEvent;
