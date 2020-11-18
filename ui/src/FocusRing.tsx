const turnOnWhenTabbing = (e: { key: string }): void => {
    if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', turnOnWhenTabbing);
        window.addEventListener('click', turnOffWhenClicking);
    }
};

const turnOffWhenClicking = (): void => {
    document.body.classList.remove('user-is-tabbing');
    window.removeEventListener('click', turnOffWhenClicking);
    window.addEventListener('keydown', turnOnWhenTabbing);
};

export default {
    turnOnWhenTabbing,
    turnOffWhenClicking,
};
