const debounce = (fn: Function, delay: number): Function => {
    let timeOutId: ReturnType<typeof setTimeout>;
    return function (...args: unknown[]): void {
        if (timeOutId) {
            clearTimeout(timeOutId);
        }
        timeOutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

export default debounce;
