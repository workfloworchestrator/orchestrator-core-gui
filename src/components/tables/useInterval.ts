import React, { useRef, useEffect } from "react";

/*
 * Inspired by https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
function useInterval(callback: () => void, delay: number) {
    const savedCallback = useRef<() => void>(() => {
        return;
    }); // To satisfy typescript the initial value should be a noop callback.

    // Remember the latest function.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== -1) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export default useInterval;
