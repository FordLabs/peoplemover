const debounce = (fn: Function, delay: number): Function => {
    let timeOutId: ReturnType<typeof setTimeout>;
    // @ts-ignore
    return function(...args): void {
        if (timeOutId) {
            clearTimeout(timeOutId);
        }
        timeOutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

export default debounce;