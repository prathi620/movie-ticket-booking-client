/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Using CSS variables from index.css for consistency if needed, 
                // but for now relying on the standard palette and the manual overrides in index.css
            }
        },
    },
    plugins: [],
}
