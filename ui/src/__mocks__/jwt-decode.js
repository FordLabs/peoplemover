const jwtDecoder = jest.fn(() => {
    return { sub: 'USER_ID' };
});

export default jwtDecoder;