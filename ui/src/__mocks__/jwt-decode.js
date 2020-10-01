const mockJwtDecode = jest.fn(() => {
    return { sub: 'USER_ID' };
});

export default mockJwtDecode;