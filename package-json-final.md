{
"name": "spanish-flashcards",
"private": true,
"version": "1.0.0",
"scripts": {
"dev": "vite",
"build": "vite build",
"preview": "vite preview",
"convert-csv": "node scripts/csvToJson.js"
},
"dependencies": {
"@radix-ui/react-progress": "^1.1.0",
"@radix-ui/react-select": "^2.1.2",
"@radix-ui/react-switch": "^1.1.1",
"class-variance-authority": "^0.7.0",
"clsx": "^2.0.0",
"react": "^18.2.0",
"react-dom": "^18.2.0",
"tailwind-merge": "^1.14.0"
},
"devDependencies": {
"@types/react": "^18.2.15",
"@types/react-dom": "^18.2.7",
"@vitejs/plugin-react": "^4.0.3",
"autoprefixer": "^10.4.14",
"postcss": "^8.4.27",
"tailwindcss": "^3.3.3",
"tailwindcss-animate": "^1.0.6",
"vite": "^4.4.5"
}
}