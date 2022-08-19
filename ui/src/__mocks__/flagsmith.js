const flagsmith = {
    init: jest.fn().mockResolvedValue(null),
    getAllFlags: jest.fn().mockReturnValue({ flags: true }),
};

export default flagsmith;
