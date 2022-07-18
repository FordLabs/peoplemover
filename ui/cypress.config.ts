import {defineConfig} from 'cypress';

export default defineConfig({
    env: {
    
        BASE_API_URL: 'http://localhost:8080',
        SPACE_UUID: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    },
    e2e: {
        baseUrl: 'http://localhost:3000',
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    },
})
