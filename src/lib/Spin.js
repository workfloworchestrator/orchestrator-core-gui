const mySpinner = {
    onStart: null,
    onStop: null,

    start: () => mySpinner.onStart && mySpinner.onStart(),
    stop: () => mySpinner.onStop && mySpinner.onStop()
};

export default mySpinner;
