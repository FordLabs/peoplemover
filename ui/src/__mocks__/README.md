#Jest manual mocks: 
Resource: https://jestjs.io/docs/en/manual-mocks

Note:
This `__mocks__` folder should be in the root folder ajacent to the node_modules folder,
however there is a bug and it will only manual mock node modules if this folder is in the src folder right now.
This folder should be moved if the bug gets resolved:
https://github.com/facebook/create-react-app/issues/7539
