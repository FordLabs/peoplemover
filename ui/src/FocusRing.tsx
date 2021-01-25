const turnOnWhenTabbing = (e: { key: string }): void => {
    if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', turnOnWhenTabbing);
        window.addEventListener('mouseup', turnOffWhenClicking);
    }
};

const turnOffWhenClicking = (): void => {
    document.body.classList.remove('user-is-tabbing');
    window.removeEventListener('mouseup', turnOffWhenClicking);
    window.addEventListener('keydown', turnOnWhenTabbing);
};

export default {
    turnOnWhenTabbing,
    turnOffWhenClicking,
};
